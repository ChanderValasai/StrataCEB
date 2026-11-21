import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

function resolveFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID?.trim()) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  if (process.env.GOOGLE_CLOUD_PROJECT?.trim()) {
    return process.env.GOOGLE_CLOUD_PROJECT.trim();
  }
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as {
        projectId?: string;
      };
      if (parsed?.projectId) {
        return String(parsed.projectId);
      }
    }
  } catch (err) {
    console.warn(
      'Unable to read firebase-applet-config.json, falling back to default projectId:',
      err
    );
  }
  return 'encoded-antler-mdzmz';
}

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> | null = null;
let certsExpiresAt = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < certsExpiresAt) {
    return cachedCerts;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google public certificates (${response.status}).`);
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  cachedCerts = (await response.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeSeconds * 1000;
  return cachedCerts;
}

function decodeBase64UrlJson<T>(segment: string): T {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as T;
}

async function verifyWithGoogleCertsFallback(
  idToken: string
): Promise<VerifiedFirebaseUser> {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase ID token.');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson<{ alg?: string; kid?: string }>(headerB64);
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid Firebase token header.');
  }

  const certs = await getGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error('Signing certificate not found for Firebase token kid.');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const sigNormalized = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
  const sigPadded = sigNormalized.padEnd(Math.ceil(sigNormalized.length / 4) * 4, '=');
  const isValid = verifier.verify(certPem, Buffer.from(sigPadded, 'base64'));
  if (!isValid) {
    throw new Error('Invalid Firebase token signature.');
  }

  const payload = decodeBase64UrlJson<{
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    name?: string;
  }>(payloadB64);

  const projectId = resolveFirebaseProjectId();
  const nowSec = Math.floor(Date.now() / 1000);

  if (payload.aud !== projectId) {
    throw new Error('Firebase token audience mismatch.');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Firebase token issuer mismatch.');
  }
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Firebase token missing subject.');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Firebase token has expired.');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new Error('Firebase token issued-at time is invalid.');
  }

  return {
    uid: payload.sub,
    email: payload.email,
    name: payload.name,
  };
}

let cachedAuth: import('firebase-admin/auth').Auth | null = null;

export async function getAdminAuth(): Promise<import('firebase-admin/auth').Auth> {
  if (!cachedAuth) {
    const [{ initializeApp, getApps }, { getAuth }] = await Promise.all([
      import('firebase-admin/app'),
      import('firebase-admin/auth'),
    ]);
    if (!getApps().length) {
      initializeApp({
        projectId: resolveFirebaseProjectId(),
      });
    }
    cachedAuth = getAuth();
  }
  return cachedAuth;
}

export async function verifyFirebaseIdToken(
  token: string
): Promise<VerifiedFirebaseUser> {
  try {
    const auth = await getAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string } | null)?.code;
    const message = err instanceof Error ? err.message : '';
    if (
      code === 'ERR_REQUIRE_ESM' ||
      message.includes('require() of ES Module') ||
      message.includes('jwks-rsa')
    ) {
      console.warn(
        'firebase-admin ESM loader incompatible on this Node runtime; using Google X.509 verifier fallback.'
      );
      return verifyWithGoogleCertsFallback(token);
    }
    throw err;
  }
}

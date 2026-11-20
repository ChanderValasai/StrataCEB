import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

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

let cachedAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    if (!getApps().length) {
      initializeApp({
        projectId: resolveFirebaseProjectId(),
      });
    }
    cachedAuth = getAuth();
  }
  return cachedAuth;
}

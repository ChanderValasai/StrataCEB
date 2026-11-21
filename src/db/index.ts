import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema.js';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: NodePgDatabase<typeof schema> | undefined;
}

function parsePoolMax(defaultMax: number): number {
  const raw = Number(process.env.PG_POOL_MAX);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : defaultMax;
}

function isLocalDatabaseUrl(databaseUrl: string): boolean {
  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '[::1]' ||
      host === '0.0.0.0'
    );
  } catch {
    return (
      databaseUrl.includes('localhost') ||
      databaseUrl.includes('127.0.0.1') ||
      databaseUrl.includes('[::1]')
    );
  }
}

function shouldUseSsl(databaseUrl: string): boolean {
  const envSsl = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (envSsl === 'false' || envSsl === '0' || envSsl === 'disable') {
    return false;
  }
  if (envSsl === 'true' || envSsl === '1' || envSsl === 'require') {
    return true;
  }

  const lowerUrl = databaseUrl.toLowerCase();
  if (lowerUrl.includes('sslmode=disable')) {
    return false;
  }
  if (
    lowerUrl.includes('sslmode=require') ||
    lowerUrl.includes('sslmode=verify-full') ||
    lowerUrl.includes('sslmode=verify-ca')
  ) {
    return true;
  }

  return !isLocalDatabaseUrl(databaseUrl);
}

export function getDatabaseConnectionMetadata(): {
  mode: 'database_url' | 'cloudsql_env' | 'unconfigured';
  isLocal: boolean;
  sslEnabled: boolean;
  poolMax: number;
} {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    const isLocal = isLocalDatabaseUrl(databaseUrl);
    return {
      mode: 'database_url',
      isLocal,
      sslEnabled: shouldUseSsl(databaseUrl),
      poolMax: parsePoolMax(isLocal ? 10 : 5),
    };
  }

  if (process.env.SQL_HOST?.trim() && process.env.SQL_DB_NAME?.trim()) {
    return {
      mode: 'cloudsql_env',
      isLocal: false,
      sslEnabled: false,
      poolMax: parsePoolMax(10),
    };
  }

  return {
    mode: 'unconfigured',
    isLocal: false,
    sslEnabled: false,
    poolMax: parsePoolMax(5),
  };
}

export function assertDatabaseConfigured(): void {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
      throw new Error(
        'Invalid DATABASE_URL format. Expected a postgresql:// or postgres:// connection string.'
      );
    }
    return;
  }

  const hasCloudSqlVars = Boolean(
    process.env.SQL_HOST?.trim() && process.env.SQL_DB_NAME?.trim()
  );
  if (!hasCloudSqlVars) {
    throw new Error(
      'Database configuration is missing. Set DATABASE_URL in .env (for local PostgreSQL or Neon/Supabase).'
    );
  }
}

function buildPoolConfig(): PoolConfig {
  assertDatabaseConfigured();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    const isLocal = isLocalDatabaseUrl(databaseUrl);
    const useSsl = shouldUseSsl(databaseUrl);

    return {
      connectionString: databaseUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: parsePoolMax(isLocal ? 10 : 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
  }

  return {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: false,
    max: parsePoolMax(10),
    connectionTimeoutMillis: 15000,
  };
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool(buildPoolConfig());

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export function getDb(): NodePgDatabase<typeof schema> {
  if (!global._drizzleDb) {
    global._drizzleDb = drizzle(createPool(), { schema });
  }
  return global._drizzleDb;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop) {
      const instance = getDb();
      const value = Reflect.get(instance, prop, instance);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  schemaReady: boolean;
  error?: string;
}> {
  try {
    assertDatabaseConfigured();
    const pool = createPool();
    await pool.query('SELECT 1');
    const tableCheck = await pool.query<{ exists: string | null }>(
      "SELECT to_regclass('public.site_settings') AS exists"
    );
    const schemaReady = Boolean(tableCheck.rows[0]?.exists);
    return { connected: true, schemaReady };
  } catch (err) {
    console.error('Database health check failed:', err);
    return {
      connected: false,
      schemaReady: false,
      error: err instanceof Error ? err.message : 'Database connection error.',
    };
  }
}

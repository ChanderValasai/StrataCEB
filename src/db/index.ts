import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: NodePgDatabase<typeof schema> | undefined;
}

function parsePoolMax(defaultMax: number): number {
  const raw = Number(process.env.PG_POOL_MAX);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : defaultMax;
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
      'Database configuration is missing. Set DATABASE_URL (for Neon/Supabase on Vercel) in your Environment Variables.'
    );
  }
}

function buildPoolConfig(): PoolConfig {
  assertDatabaseConfigured();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    const isLocal =
      databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    const disableSsl =
      process.env.DATABASE_SSL === 'false' ||
      databaseUrl.includes('sslmode=disable');

    return {
      connectionString: databaseUrl,
      ssl: isLocal || disableSsl ? false : { rejectUnauthorized: false },
      max: parsePoolMax(5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
  }

  return {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
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
    get(_target, prop, receiver) {
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

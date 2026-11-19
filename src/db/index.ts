import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

function buildPoolConfig(): PoolConfig {
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
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
  }

  return {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    max: Number(process.env.PG_POOL_MAX || 10),
    connectionTimeoutMillis: 15000,
  };
}

export function assertDatabaseConfigured(): void {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasCloudSqlVars = Boolean(
    process.env.SQL_HOST?.trim() && process.env.SQL_DB_NAME?.trim()
  );

  if (!hasDatabaseUrl && !hasCloudSqlVars) {
    throw new Error(
      'Database configuration is missing. Set DATABASE_URL (recommended for Neon/Supabase on Vercel) or SQL_HOST/SQL_USER/SQL_PASSWORD/SQL_DB_NAME.'
    );
  }
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool(buildPoolConfig());

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

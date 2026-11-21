import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();

function resolveCredentials() {
  if (databaseUrl) {
    const isLocal =
      databaseUrl.includes('localhost') ||
      databaseUrl.includes('127.0.0.1') ||
      process.env.DATABASE_SSL?.trim().toLowerCase() === 'false';
    if (isLocal && !databaseUrl.includes('sslmode=')) {
      const sep = databaseUrl.includes('?') ? '&' : '?';
      return { url: `${databaseUrl}${sep}sslmode=disable` };
    }
    return { url: databaseUrl };
  }

  const sqlHost = process.env.SQL_HOST;
  const sqlDbName = process.env.SQL_DB_NAME;
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;

  if (!sqlHost) {
    throw new Error('DATABASE_URL or SQL_HOST must be set in environment variables.');
  }
  if (!sqlDbName) {
    throw new Error('DATABASE_URL or SQL_DB_NAME must be set in environment variables.');
  }
  if (!user) {
    throw new Error('DATABASE_URL or SQL_ADMIN_USER must be set in environment variables.');
  }
  if (!password) {
    throw new Error('DATABASE_URL or SQL_ADMIN_PASSWORD must be set in environment variables.');
  }

  return {
    host: sqlHost,
    user,
    password,
    database: sqlDbName,
    ssl: false as const,
  };
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: resolveCredentials(),
  verbose: true,
});

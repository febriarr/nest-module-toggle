import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/core/**/*.schema.ts', './src/modules/**/*.schema.ts'],
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
});

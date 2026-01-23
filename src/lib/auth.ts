import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import * as schema from '@/db/schema';

import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema,
  }),

  // adicionando autenticacao do google
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Configuração dos schemas
  user: {
    modelName: 'usersTable',
  },
  session: {
    modelName: 'sessionsTable',
  },
  account: {
    modelName: 'accountsTable',
  },
  verification: {
    modelName: 'verificationsTable',
  },

  emailAndPassword: {
    enabled: true,
  },
});

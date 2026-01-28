'use server';

import { headers } from 'next/headers';

import { db } from '@/db';
import { doctorsTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertDoctorSchema } from './schema';

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    // pega dados da sessao e do banco de dados conforme necessário.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Verifica se está autenticado
    if (!session?.user) {
      throw new Error('Usuário não autenticado.');
    }

    // Verifica se nao tem clinica
    if (!session.user.clinic?.id) {
      throw new Error('Usuário não está vinculado a nenhuma clínica.');
    }

    await db
      .insert(doctorsTable)
      .values({
        ...parsedInput,
        clinicId: session?.user.clinic?.id,
      })
      // Se o ID já existir, atualiza o registro existente
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
        },
      });
  });

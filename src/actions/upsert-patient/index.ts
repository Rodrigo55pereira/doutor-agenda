'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/db';
import { patientsTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertPatientSchema } from './schema';

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Usuário não autenticado.');
    }

    if (!session.user.clinic?.id) {
      throw new Error('Usuário não está vinculado a nenhuma clínica.');
    }

    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        clinicId: session.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
        },
      });

    revalidatePath('/patients');
  });

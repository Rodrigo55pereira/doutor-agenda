'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { clinicsTable, usersToClinicsTable } from '@/db/schema';
import { auth } from '@/lib/auth';

export const createClinic = async (name: string) => {
  // verifica autorizacao
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // cria clinica
  // desistrutura e pega o primeiro valor do array retornado pelo returning
  const [clinic] = await db.insert(clinicsTable).values({ name }).returning();

  // relacao usuari/clinica
  await db.insert(usersToClinicsTable).values({
    userId: session.user.id,
    clinicId: clinic.id,
  });

  redirect('/dashboard');
};

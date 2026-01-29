'use server';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/db';
import { doctorsTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertDoctorSchema } from './schema';

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const availableFromTime = parsedInput.availableFromTime;
    const availableToTime = parsedInput.availableToTime;

    const availableFromTimeUTC = dayjs()
      .set('hour', parseInt(availableFromTime.split(':')[0])) // [15, 30, 00]
      .set('minute', parseInt(availableFromTime.split(':')[1]))
      .set('second', parseInt(availableFromTime.split(':')[2]))
      .utc();

    const availableToTimeUTC = dayjs()
      .set('hour', parseInt(availableToTime.split(':')[0])) // [15, 30, 00]
      .set('minute', parseInt(availableToTime.split(':')[1]))
      .set('second', parseInt(availableToTime.split(':')[2]))
      .utc();

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
        availableFromTime: availableFromTimeUTC.format('HH:mm:ss'),
        availableToTime: availableToTimeUTC.format('HH:mm:ss'),
      })
      // Se o ID já existir, atualiza o registro existente
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
          availableFromTime: availableFromTimeUTC.format('HH:mm:ss'),
          availableToTime: availableToTimeUTC.format('HH:mm:ss'),
        },
      });
    revalidatePath('/doctors');
  });

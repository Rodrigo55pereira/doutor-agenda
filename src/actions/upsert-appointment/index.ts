'use server';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/db';
import { appointmentsTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { actionClient } from '@/lib/next-safe-action';

import { upsertAppointmentSchema } from './schema';

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
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

    // Combine date and time into a single datetime
    const appointmentDateTime = dayjs(parsedInput.date)
      .set('hour', parseInt(parsedInput.time.split(':')[0]))
      .set('minute', parseInt(parsedInput.time.split(':')[1]))
      .toDate();

    if (parsedInput.id) {
      // Update existing appointment
      await db
        .update(appointmentsTable)
        .set({
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          date: appointmentDateTime,
        })
        .where(eq(appointmentsTable.id, parsedInput.id));
    } else {
      // Insert new appointment
      await db.insert(appointmentsTable).values({
        clinicId: session.user.clinic.id,
        ...parsedInput,
        date: appointmentDateTime,
      });
    }

    revalidatePath('/appointments');
  });

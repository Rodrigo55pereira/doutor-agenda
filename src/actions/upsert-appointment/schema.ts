import z from 'zod';

export const upsertAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: 'Paciente inválido.',
  }),
  doctorId: z.string().uuid({
    message: 'Médico inválido.',
  }),
  appointmentPriceInCents: z.number().min(0, {
    message: 'O preço da consulta é obrigatório.',
  }),
  date: z.date({
    message: 'Data é obrigatória.',
  }),
  time: z.string().min(1, {
    message: 'Horário é obrigatório.',
  }),
});

export type UpsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>;

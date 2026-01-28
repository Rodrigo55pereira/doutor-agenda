import z from 'zod';

// Schema da serverAction é diferente do schema do formulário
export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, {
      message: 'O nome é obrigatório.',
    }),
    specialty: z.string().trim().min(1, {
      message: 'A especialidade é obrigatória.',
    }),
    appointmentPriceInCents: z.number().min(0, {
      message: 'O preço da consulta é obrigatório.',
    }),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z.string().min(1, {
      message: 'Hora de início é obrigatório.',
    }),

    availableToTime: z.string().min(1, {
      message: 'Hora de término é obrigatório.',
    }),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message: 'O horário de termino não pode ser anterior ao horário de inicio.',
      path: ['availableToTime'],
    },
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;

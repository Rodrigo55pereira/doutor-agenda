'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import z from 'zod';

import { upsertAppointment } from '@/actions/upsert-appointment';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appointmentsTable, doctorsTable, patientsTable } from '@/db/schema';

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, {
    message: 'Selecione um paciente.',
  }),
  doctorId: z.string().min(1, {
    message: 'Selecione um médico.',
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

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  appointment?: typeof appointmentsTable.$inferSelect;
  isOpen: boolean;
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  patients,
  doctors,
  appointment,
  isOpen,
  onSuccess,
}: AppointmentFormProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<
    typeof doctorsTable.$inferSelect | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const form = useForm<AppointmentFormValues>({
    shouldUnregister: true,
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? '',
      doctorId: appointment?.doctorId ?? '',
      appointmentPriceInCents: 0,
      date: appointment?.date,
      time: appointment?.date ? format(appointment.date, 'HH:mm') : '',
    },
  });

  const patientId = form.watch('patientId');
  const doctorId = form.watch('doctorId');

  // Update selected doctor when doctorId changes
  useEffect(() => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor || null);

    if (doctor) {
      form.setValue('appointmentPriceInCents', doctor.appointmentPriceInCents / 100);
    }
  }, [doctorId, doctors, form]);

  // Reset form when dialog closes or appointment changes
  useEffect(() => {
    if (isOpen) {
      const appointmentPrice = appointment?.date
        ? (() => {
            const doctor = doctors.find((d) => d.id === appointment.doctorId);
            return doctor ? doctor.appointmentPriceInCents / 100 : 0;
          })()
        : 0;

      form.reset({
        patientId: appointment?.patientId ?? '',
        doctorId: appointment?.doctorId ?? '',
        appointmentPriceInCents: appointmentPrice,
        date: appointment?.date,
        time: appointment?.date ? format(appointment.date, 'HH:mm') : '',
      });
      setSelectedDate(appointment?.date);
      if (appointment?.doctorId) {
        setSelectedDoctor(doctors.find((d) => d.id === appointment.doctorId) || null);
      }
    }
  }, [isOpen, appointment, doctors, form]);

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success(
        appointment
          ? 'Agendamento atualizado com sucesso!'
          : 'Agendamento realizado com sucesso!',
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error('Erro ao salvar o agendamento');
    },
  });

  const onSubmit = async (values: AppointmentFormValues) => {
    upsertAppointmentAction.execute({
      id: appointment?.id,
      ...values,
      appointmentPriceInCents: values.appointmentPriceInCents * 100,
    });
  };

  const isDateTimeFieldsEnabled = patientId && doctorId;
  const isAppointmentPriceEnabled = doctorId;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? 'Edite os detalhes do agendamento.'
            : 'Crie um novo agendamento para um paciente.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          {/* Patient Select */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Doctor Select */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Appointment Price */}
          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Consulta</FormLabel>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value.floatValue);
                  }}
                  disabled={!isAppointmentPriceEnabled}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  allowNegative={false}
                  allowLeadingZeros={false}
                  prefix="R$ "
                  placeholder="R$ 0,00"
                  customInput={Input}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!isDateTimeFieldsEnabled}
                      data-empty={!selectedDate}
                      className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        field.onChange(date);
                      }}
                      disabled={(date) => date < startOfDay(new Date())}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Appointment Time */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!isDateTimeFieldsEnabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Manhã</SelectLabel>
                      <SelectItem value="05:00:00">05:00</SelectItem>
                      <SelectItem value="05:30:00">05:30</SelectItem>
                      <SelectItem value="06:00:00">06:00</SelectItem>
                      <SelectItem value="06:30:00">06:30</SelectItem>
                      <SelectItem value="07:00:00">07:00</SelectItem>
                      <SelectItem value="07:30:00">07:30</SelectItem>
                      <SelectItem value="08:00:00">08:00</SelectItem>
                      <SelectItem value="08:30:00">08:30</SelectItem>
                      <SelectItem value="09:00:00">09:00</SelectItem>
                      <SelectItem value="09:30:00">09:30</SelectItem>
                      <SelectItem value="10:00:00">10:00</SelectItem>
                      <SelectItem value="10:30:00">10:30</SelectItem>
                      <SelectItem value="11:00:00">11:00</SelectItem>
                      <SelectItem value="11:30:00">11:30</SelectItem>
                      <SelectItem value="12:00:00">12:00</SelectItem>
                      <SelectItem value="12:30:00">12:30</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Tarde</SelectLabel>
                      <SelectItem value="13:00:00">13:00</SelectItem>
                      <SelectItem value="13:30:00">13:30</SelectItem>
                      <SelectItem value="14:00:00">14:00</SelectItem>
                      <SelectItem value="14:30:00">14:30</SelectItem>
                      <SelectItem value="15:00:00">15:00</SelectItem>
                      <SelectItem value="15:30:00">15:30</SelectItem>
                      <SelectItem value="16:00:00">16:00</SelectItem>
                      <SelectItem value="16:30:00">16:30</SelectItem>
                      <SelectItem value="17:00:00">17:00</SelectItem>
                      <SelectItem value="17:30:00">17:30</SelectItem>
                      <SelectItem value="18:00:00">18:00</SelectItem>
                      <SelectItem value="18:30:00">18:30</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Noite</SelectLabel>
                      <SelectItem value="19:00:00">19:00</SelectItem>
                      <SelectItem value="19:30:00">19:30</SelectItem>
                      <SelectItem value="20:00:00">20:00</SelectItem>
                      <SelectItem value="20:30:00">20:30</SelectItem>
                      <SelectItem value="21:00:00">21:00</SelectItem>
                      <SelectItem value="21:30:00">21:30</SelectItem>
                      <SelectItem value="22:00:00">22:00</SelectItem>
                      <SelectItem value="22:30:00">22:30</SelectItem>
                      <SelectItem value="23:00:00">23:00</SelectItem>
                      <SelectItem value="23:30:00">23:30</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertAppointmentAction.isPending}
              className="w-full"
            >
              {upsertAppointmentAction.isPending
                ? 'Salvando...'
                : appointment
                  ? 'Atualizar'
                  : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { toast } from 'sonner';
import z from 'zod';

import { upsertPatient } from '@/actions/upsert-patient';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { patientsTable } from '@/db/schema';

import DeletePatient from './delete-patient';

const formScheme = z.object({
  name: z.string().trim().min(1, {
    message: 'O nome é obrigatório.',
  }),
  email: z.string().email({
    message: 'Email inválido.',
  }),
  phoneNumber: z.string().trim().min(1, {
    message: 'O número de telefone é obrigatório.',
  }),
  sex: z.enum(['male', 'female'], {
    message: 'Sexo é obrigatório.',
  }),
});

type FormValues = z.infer<typeof formScheme>;

interface UpsertPatientFormProps {
  isOpen: boolean;
  patient?: typeof patientsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertPatientForm = ({ isOpen, patient, onSuccess }: UpsertPatientFormProps) => {
  const form = useForm<FormValues>({
    shouldUnregister: true,
    resolver: zodResolver(formScheme),
    defaultValues: {
      name: patient?.name ?? '',
      email: patient?.email ?? '',
      phoneNumber: patient?.phoneNumber ?? '',
      sex: patient?.sex ?? 'male',
    },
  });

  const upsertPatientAction = useAction(upsertPatient, {
    onSuccess: () => {
      toast.success('Paciente adicionado com sucesso!');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Erro ao adicionar o paciente');
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertPatientAction.execute({
      id: patient?.id,
      ...values,
    });
  };

  useEffect(() => {
    // “Quando o modal abrir, sincronize o formulário com o paciente atual.”
    if (isOpen) {
      // “Ignore tudo que estava digitado antes
      // e use ESTE OBJETO como o novo estado do formulário.”
      form.reset(patient);
    }
  }, [isOpen, form, patient]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{patient ? patient.name : 'Adicionar Paciente'}</DialogTitle>
        <DialogDescription>
          {patient
            ? 'Edite as informações desse paciente.'
            : 'Adicione um novo paciente.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Paciente</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    {...field}
                    format="+55 (##) #####-####"
                    placeholder="+55 (00) 00000-0000"
                    customInput={Input}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <div className="w-full space-y-2">
              <Button
                type="submit"
                disabled={upsertPatientAction.isPending}
                className="w-full"
              >
                {upsertPatientAction.isPending
                  ? 'Salvando...'
                  : patient
                    ? 'Atualizar'
                    : 'Adicionar'}
              </Button>
              {patient && <DeletePatient patient={patient} onSuccess={onSuccess} />}
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertPatientForm;

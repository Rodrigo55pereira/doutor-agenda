'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { createClinic } from '@/actions/create-clinic';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const clinicFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Nome é obrigatório' }),
});

type ClinicFormData = z.infer<typeof clinicFormSchema>;

const ClinicForm = () => {
  const router = useRouter();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: ClinicFormData) => {
    try {
      // ja cria e redireciona
      await createClinic(data.name);
    } catch (error) {
      if (isRedirectError(error)) {
        // redirecionamento tratado pelo nextjs
        return;
      }
      console.log(error);
      toast.error('Erro ao criar clínica');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da clínica" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Criar clínica
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
export default ClinicForm;

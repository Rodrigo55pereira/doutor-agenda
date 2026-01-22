'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

import PasswordField from './form/password-field';

const registerScheme = z.object({
  name: z.string().trim().min(1, { message: 'O nome é obrigatório' }),

  email: z
    .string()
    .trim()
    .min(1, { message: 'E-mail é obrigatorio' })
    .email({ message: 'E-mail inválido' }),

  password: z
    .string()
    .trim()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' }),
});

// Usamos <z.infer<typeof registerScheme>> para que o TypeScript saiba qual é o formato dos dados no form, com base no esquema zod.
// z.infer lê (infere) automaticamente o tipo dos dados a partir do registerScheme. Isso garante que os campos terão o tipo correto e ajuda a evitar erros.
type RegisterScheme = z.infer<typeof registerScheme>;

const SignUpForm = () => {
  const router = useRouter();
  // Aqui criamos o formulário com useForm do React Hook Form.
  const form = useForm<RegisterScheme>({
    resolver: zodResolver(registerScheme), // Valida os dados usando o esquema zod antes de enviar o form.
    defaultValues: {
      name: '', // valor inicial do campo nome
      email: '', // valor inicial do campo email
      password: '', // valor inicial do campo senha
    },
  });

  const onSubmit = async (values: RegisterScheme) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (ctx) => {
          if (ctx.error.code === 'USER_ALREADY_EXISTS') {
            toast.error('E-mail já cadastrado.');
            return;
          }
          toast.error('Erro ao criar conta.');
        },
      },
    );
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Criar conta para continuar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu e-mail" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PasswordField
              control={form.control}
              name="password"
              label="Crie sua senha"
              placeholder="Mínimo 8 caracteres"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Criar conta'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
export default SignUpForm;

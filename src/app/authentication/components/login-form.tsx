'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
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

import PasswordField from './_form/password-field';

const loginScheme = z.object({
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

// Usamos <z.infer<typeof loginScheme>> para que o TypeScript saiba qual é o formato dos dados no form, com base no esquema zod.
// z.infer lê (infere) automaticamente o tipo dos dados a partir do loginScheme. Isso garante que os campos terão o tipo correto e ajuda a evitar erros.
type LoginScheme = z.infer<typeof loginScheme>;

const LoginForm = () => {
  const router = useRouter();
  // Aqui criamos o formulário com useForm do React Hook Form.
  const form = useForm<LoginScheme>({
    resolver: zodResolver(loginScheme), // Valida os dados usando o esquema zod antes de enviar o form.
    defaultValues: {
      email: '', // valor inicial do campo email
      password: '', // valor inicial do campo senha
    },
  });

  const handleSubmit = async (values: LoginScheme) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: () => {
          toast.error('E-mail ou senha inválidos.');
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Faça login para continuar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <PasswordField control={form.control} name="password" />
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-2">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                type="button"
                onClick={() => handleGoogleLogin()}
              >
                <Image width={16} height={16} src="/google.svg" alt="Google" />
                Entrar com Google
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
export default LoginForm;

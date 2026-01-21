import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  // Aqui criamos o formulário com useForm do React Hook Form.
  const form = useForm<RegisterScheme>({
    resolver: zodResolver(registerScheme), // Valida os dados usando o esquema zod antes de enviar o form.
    defaultValues: {
      name: '', // valor inicial do campo nome
      email: '', // valor inicial do campo email
      password: '', // valor inicial do campo senha
    },
  });

  const onSubmit = (values: RegisterScheme) => {
    console.log(values);
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite sua senha" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Criar conta
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
export default SignUpForm;

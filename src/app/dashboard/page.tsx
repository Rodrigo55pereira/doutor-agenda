import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

import { auth } from '@/lib/auth';

import SignOutButton from './components/sign-out-button';

const DashboardPage = async () => {
  // Cria sessao do Better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // redireciona para o authentication se nao tiver autenticado.
  if (!session?.user) {
    redirect('/authentication');
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <h1>{session?.user.name}</h1>
      <h1>{session?.user.email}</h1>
      <SignOutButton />
    </div>
  );
};
export default DashboardPage;

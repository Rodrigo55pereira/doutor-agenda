import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { AppSidebar } from './_components/app-sidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
};
export default ProtectedLayout;

interface PageProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageProps) => {
  return <div className="space-y-6 p-6">{children}</div>;
};

export const PageHeader = ({ children }: PageProps) => {
  return <div className="flex items-center justify-between">{children}</div>;
};

export const PageHeaderContent = ({ children }: PageProps) => {
  return <div className="space-y-1">{children}</div>;
};

export const PageTitle = ({ children }: PageProps) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};

export const PageDescription = ({ children }: PageProps) => {
  return <p className="text-muted-foreground text-sm">{children}</p>;
};

export const PageActions = ({ children }: PageProps) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const PageContent = ({ children }: PageProps) => {
  return <div className="space-y-6">{children}</div>;
};

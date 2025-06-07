import AuthLayout from '@/app/components/AuthLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AuthLayout>{children}</AuthLayout>
  );
} 
import { Providers } from '@/context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}

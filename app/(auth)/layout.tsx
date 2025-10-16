import { AuthLayout } from "@/modules/auth/layouts";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

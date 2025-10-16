import { DashboardLayout } from "@/modules/dashboard/layouts";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

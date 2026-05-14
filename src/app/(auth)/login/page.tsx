import { DemoLoginCards } from "@/components/layout/demo-login-cards";
import { getDemoAccounts } from "@/services/auth.service";

export default async function LoginPage() {
  const accounts = await getDemoAccounts();

  return <DemoLoginCards accounts={accounts} />;
}

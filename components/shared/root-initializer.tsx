import { getSetting } from "@/lib/actions/setting.actions";
import ClientProviders from "@/components/shared/client-providers";

export default async function RootInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = await getSetting(); // Server-safe fetch

  return <ClientProviders setting={setting}>{children}</ClientProviders>;
}

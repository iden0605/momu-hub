import { requireAppUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

// Signed-in shell, the header stays mounted while pages load
export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAppUser();
  return (
    <>
      <Nav user={user} />
      {children}
    </>
  );
}

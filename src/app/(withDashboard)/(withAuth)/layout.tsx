import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { auth } from "~/server/auth";

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const session = await auth();
  if (!session?.user) redirect("/");
  return <>{children}</>;
}

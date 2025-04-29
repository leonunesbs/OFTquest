import { LogIn, LogOut } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { type Session } from "next-auth";
import Link from "next/link";
import { AppSidebar } from "~/components/AppSidebar";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { auth } from "~/server/auth";

function DashboardHeader({ session }: { session: Session | null }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle variant="single" />
        {session?.user ? (
          <Button asChild variant="ghost" size="icon">
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="ghost" size="icon">
            <Link href="/api/auth/signin">
              <LogIn className="h-4 w-4" />
              <span className="sr-only">Entrar</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4 px-2 py-6 sm:px-4 lg:px-8">
      {children}
    </div>
  );
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader session={session} />
        <DashboardContent>{children}</DashboardContent>
      </SidebarInset>
    </SidebarProvider>
  );
}

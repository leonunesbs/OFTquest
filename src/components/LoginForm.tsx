import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { auth } from "~/server/auth";
import { ProviderButton } from "./ProviderButton";

export async function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">OFT.quest</span>
          </Link>
          <h1 className="text-xl font-bold">Bem-vindo ao OFT.quest</h1>
          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link
              href="/api/auth/signin"
              className="underline underline-offset-4"
            >
              Criar conta
            </Link>
          </div>
        </div>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </div>
        </form>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
        <ProviderButton provider="github" />
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Ao continuar, você concorda com nossos{" "}
        <Link href="/terms">Termos de Serviço</Link> e{" "}
        <Link href="/privacy">Política de Privacidade</Link>.
      </div>
    </div>
  );
}

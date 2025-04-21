import Link from "next/link";
import { auth } from "~/server/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <div>
        <span>Não autorizado</span>
        <Link href={"/"}>Voltar</Link>
      </div>
    );
  }

  if (session.user.role != "admin") {
    return <div>Você não é administrador!</div>;
  }
  return <div>Status: {session.user.role}</div>;
}

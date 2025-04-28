import { HomeIcon } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "~/components/CheckoutButton";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de privacidade e proteção de dados da plataforma OFT.quest",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Política de Privacidade</h1>

      <div className="prose prose-gray dark:prose-invert">
        <h2>1. Introdução</h2>
        <p>
          Esta Política de Privacidade descreve como o OFT.quest coleta, usa e
          protege suas informações pessoais quando você usa nossa plataforma.
          Estamos comprometidos em garantir que sua privacidade seja protegida.
        </p>

        <h2>2. Informações que Coletamos</h2>
        <p>Podemos coletar as seguintes informações:</p>
        <ul>
          <li>Nome e informações de contato, incluindo endereço de e-mail</li>
          <li>Informações demográficas como preferências e interesses</li>
          <li>Dados de uso da plataforma</li>
          <li>Informações técnicas sobre seu dispositivo e conexão</li>
        </ul>

        <h2>3. Como Usamos suas Informações</h2>
        <p>Usamos suas informações para:</p>
        <ul>
          <li>Fornecer e melhorar nossos serviços</li>
          <li>Personalizar sua experiência</li>
          <li>Comunicar-se com você sobre atualizações e novidades</li>
          <li>Analisar o uso da plataforma para melhorias</li>
        </ul>

        <h2>4. Segurança</h2>
        <p>
          Estamos comprometidos em garantir que suas informações estejam
          seguras. Implementamos medidas de segurança técnicas e organizacionais
          apropriadas para proteger suas informações pessoais contra acesso não
          autorizado, alteração, divulgação ou destruição.
        </p>

        <h2>5. Cookies</h2>
        <p>
          Utilizamos cookies para melhorar sua experiência em nosso site. Os
          cookies são pequenos arquivos que são armazenados em seu dispositivo e
          nos ajudam a entender como você interage com nossa plataforma.
        </p>

        <h2>6. Compartilhamento de Dados</h2>
        <p>
          Não vendemos, trocamos ou transferimos suas informações pessoais para
          terceiros sem seu consentimento, exceto quando necessário para
          fornecer nossos serviços ou quando exigido por lei.
        </p>

        <h2>7. Seus Direitos</h2>
        <p>Você tem o direito de:</p>
        <ul>
          <li>Acessar suas informações pessoais</li>
          <li>Corrigir informações imprecisas</li>
          <li>Solicitar a exclusão de seus dados</li>
          <li>Retirar seu consentimento para o processamento de dados</li>
        </ul>

        <h2>8. Alterações na Política de Privacidade</h2>
        <p>
          Podemos atualizar nossa Política de Privacidade periodicamente.
          Recomendamos que você revise esta página regularmente para se manter
          informado sobre como estamos protegendo suas informações.
        </p>

        <h2>9. Contato</h2>
        <p>
          Se você tiver dúvidas sobre nossa Política de Privacidade, entre em
          contato conosco através do e-mail de suporte.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/" passHref>
            <Button variant="outline">
              <HomeIcon className="h-4 w-4" />
              Início
            </Button>
          </Link>
          <CheckoutButton className="w-fit" />
        </div>
      </div>
    </div>
  );
}

import { HomeIcon } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "~/components/CheckoutButton";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Termos de serviço e condições de uso da plataforma OFT.quest",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Termos de Serviço</h1>

      <div className="prose prose-gray dark:prose-invert">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e usar o OFT.quest, você concorda em cumprir estes termos
          de serviço, todas as leis e regulamentos aplicáveis, e reconhece que é
          responsável pelo cumprimento de quaisquer leis locais aplicáveis.
        </p>

        <h2>2. Uso da Licença</h2>
        <p>
          É concedida permissão para acessar temporariamente o OFT.quest para
          uso pessoal e não comercial. Esta é a concessão de uma licença, não
          uma transferência de título, e sob esta licença você não pode:
        </p>
        <ul>
          <li>Modificar ou copiar os materiais</li>
          <li>Usar os materiais para qualquer finalidade comercial</li>
          <li>
            Tentar descompilar ou fazer engenharia reversa de qualquer software
            contido no OFT.quest
          </li>
          <li>
            Remover quaisquer direitos autorais ou outras notações de
            propriedade dos materiais
          </li>
        </ul>

        <h2>3. Isenção de Responsabilidade</h2>
        <p>
          Os materiais no OFT.quest são fornecidos &ldquo;como estão&rdquo;. O
          OFT.quest não oferece garantias, expressas ou implícitas, e por este
          meio isenta e nega todas as outras garantias, incluindo, sem
          limitação, garantias implícitas ou condições de comercialização,
          adequação a um propósito específico, ou não violação de propriedade
          intelectual ou outra violação de direitos.
        </p>

        <h2>4. Limitações</h2>
        <p>
          Em nenhum caso o OFT.quest ou seus fornecedores serão responsáveis por
          quaisquer danos (incluindo, sem limitação, danos por perda de dados ou
          lucro, ou devido à interrupção dos negócios) decorrentes do uso ou da
          incapacidade de usar os materiais no OFT.quest.
        </p>

        <h2>5. Precisão dos Materiais</h2>
        <p>
          Os materiais exibidos no OFT.quest podem incluir erros técnicos,
          tipográficos ou fotográficos. O OFT.quest não garante que qualquer
          material em seu site seja preciso, completo ou atual. O OFT.quest pode
          fazer alterações nos materiais contidos em seu site a qualquer
          momento, sem aviso prévio.
        </p>

        <h2>6. Links</h2>
        <p>
          O OFT.quest não analisou todos os sites vinculados ao seu site e não é
          responsável pelo conteúdo de nenhum site vinculado. A inclusão de
          qualquer link não implica endosso por parte do OFT.quest do site. O
          uso de qualquer site vinculado é por conta e risco do usuário.
        </p>

        <h2>7. Modificações</h2>
        <p>
          O OFT.quest pode revisar estes termos de serviço do site a qualquer
          momento, sem aviso prévio. Ao usar este site, você concorda em ficar
          vinculado à versão atual destes termos de serviço.
        </p>

        <h2>8. Lei Aplicável</h2>
        <p>
          Estes termos e condições são regidos e interpretados de acordo com as
          leis do Brasil e você se submete irrevogavelmente à jurisdição
          exclusiva dos tribunais naquele estado ou localidade.
        </p>

        <h2>9. Serviços por Assinatura</h2>
        <p>
          Ao contratar um serviço por assinatura, você concorda em pagar as
          taxas recorrentes correspondentes ao plano escolhido. As assinaturas
          renovam-se automaticamente no final de cada período de cobrança, a
          menos que canceladas pelo usuário antes da data de renovação. Você
          concorda em fornecer métodos de pagamento válidos e autorizar débitos
          automáticos.
        </p>
        <p>
          Quaisquer alterações nas taxas de assinatura ou termos de cobrança
          serão comunicadas com no mínimo 30 dias de antecedência. Você tem
          direito de cancelar sua assinatura a qualquer momento, seguindo o
          procedimento descrito na seção de cancelamento, mas não terá direito a
          reembolso de períodos já iniciados, exceto quando exigido por lei.
        </p>
        <p>
          Você é responsável pelo pagamento de quaisquer impostos ou encargos
          governamentais aplicáveis associados à assinatura. Em caso de
          inadimplência, reservamo-nos o direito de suspender ou cancelar seu
          acesso ao serviço até que os valores pendentes sejam regularizados.
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

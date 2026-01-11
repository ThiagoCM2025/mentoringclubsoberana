import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { SoberanaLogoMark } from "@/components/landing/SoberanaLogoMark";
import { formatBrazilDate, getBrazilNow, getBrazilYear } from "@/lib/dateUtils";

const Privacidade = () => {
  return (
    <>
      <SEO 
        title="Política de Privacidade | Soberana Mentoria"
        description="Política de Privacidade da Soberana Mentoria. Saiba como coletamos, usamos e protegemos seus dados pessoais."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-foreground text-background py-6">
          <div className="container-soberana px-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-background/70 hover:text-secondary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </Link>
              <SoberanaLogoMark variant="light" size="sm" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container-soberana px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8">
              Política de Privacidade
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-8">
                Última atualização: {formatBrazilDate(getBrazilNow(), { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">1. Introdução</h2>
                <p>
                  A Soberana Mentoria ("nós", "nosso" ou "Soberana") está comprometida em proteger a privacidade 
                  dos visitantes do nosso site e dos participantes dos nossos programas de mentoria. Esta Política 
                  de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">2. Informações que Coletamos</h2>
                <p className="mb-4">Podemos coletar as seguintes informações:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dados de identificação:</strong> nome completo, e-mail, telefone</li>
                  <li><strong>Dados profissionais:</strong> área de atuação, tempo de advocacia, informações sobre seu escritório</li>
                  <li><strong>Dados de uso:</strong> como você interage com nosso site e plataforma</li>
                  <li><strong>Dados de comunicação:</strong> mensagens trocadas conosco</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">3. Como Usamos suas Informações</h2>
                <p className="mb-4">Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e melhorar nossos serviços de mentoria</li>
                  <li>Enviar comunicações relevantes sobre nossos programas</li>
                  <li>Personalizar sua experiência na plataforma</li>
                  <li>Processar pagamentos e gerenciar sua conta</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">4. Compartilhamento de Dados</h2>
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins 
                  de marketing. Podemos compartilhar dados com prestadores de serviços que nos auxiliam na 
                  operação do negócio, sempre sob acordos de confidencialidade.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">5. Segurança dos Dados</h2>
                <p>
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações 
                  contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia, 
                  servidores seguros e políticas de acesso restrito.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">6. Seus Direitos</h2>
                <p className="mb-4">De acordo com a LGPD, você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar consentimentos dados anteriormente</li>
                  <li>Solicitar a portabilidade dos dados</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">7. Cookies</h2>
                <p>
                  Utilizamos cookies para melhorar sua experiência de navegação. Cookies são pequenos arquivos 
                  de texto armazenados em seu dispositivo que nos ajudam a entender como você usa nosso site 
                  e a personalizar seu conteúdo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">8. Contato</h2>
                <p>
                  Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato conosco:
                </p>
                <p className="mt-4">
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:contato@soberanamentoria.com.br" className="text-secondary hover:underline">
                    contato@soberanamentoria.com.br
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">9. Alterações nesta Política</h2>
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações serão 
                  publicadas nesta página com a data de atualização revisada. Recomendamos que você revise 
                  esta política regularmente.
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-background py-6">
          <div className="container-soberana px-4 text-center text-sm text-background/60">
            © {getBrazilYear()} Soberana Mentoring Club. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Privacidade;

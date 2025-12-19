import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { SoberanaLogoMark } from "@/components/landing/SoberanaLogoMark";

const Termos = () => {
  return (
    <>
      <SEO 
        title="Termos de Uso | Soberana Mentoria"
        description="Termos de Uso da Soberana Mentoria. Conheça as condições para utilização dos nossos serviços e plataforma."
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
              Termos de Uso
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-8">
                Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e utilizar o site e os serviços da Soberana Mentoria, você concorda em cumprir 
                  e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes 
                  termos, não deve utilizar nossos serviços.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">2. Descrição dos Serviços</h2>
                <p>
                  A Soberana Mentoria oferece programas de mentoria, cursos online, workshops e eventos 
                  presenciais voltados para advogadas que desejam desenvolver suas carreiras e negócios 
                  jurídicos. Os serviços incluem acesso à plataforma de ensino, materiais didáticos, 
                  comunidade exclusiva e acompanhamento personalizado.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">3. Cadastro e Conta</h2>
                <p className="mb-4">Para utilizar nossos serviços, você deve:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer informações verdadeiras, precisas e completas</li>
                  <li>Manter suas informações de conta atualizadas</li>
                  <li>Proteger a confidencialidade de sua senha</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">4. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo disponibilizado em nossa plataforma, incluindo textos, vídeos, imagens, 
                  metodologias e materiais didáticos, são de propriedade exclusiva da Soberana Mentoria 
                  ou de seus licenciadores. É proibida a reprodução, distribuição ou modificação sem 
                  autorização prévia por escrito.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">5. Uso Permitido</h2>
                <p className="mb-4">Você concorda em:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usar os serviços apenas para fins pessoais e não comerciais</li>
                  <li>Não compartilhar seu acesso com terceiros</li>
                  <li>Não copiar, gravar ou distribuir o conteúdo dos cursos</li>
                  <li>Respeitar os demais participantes da comunidade</li>
                  <li>Não utilizar os serviços para fins ilegais</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">6. Pagamentos e Reembolsos</h2>
                <p className="mb-4">
                  Os valores e condições de pagamento estão descritos na página de cada programa. 
                  A política de reembolso segue as seguintes diretrizes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Garantia de 7 dias para cursos online, conforme Código de Defesa do Consumidor</li>
                  <li>Eventos presenciais podem ter políticas específicas informadas no momento da compra</li>
                  <li>Solicitações de reembolso devem ser feitas por e-mail</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
                <p>
                  A Soberana Mentoria não garante resultados específicos decorrentes da utilização de 
                  nossos serviços. Os resultados dependem do esforço e dedicação individual de cada 
                  participante. Não nos responsabilizamos por decisões tomadas com base no conteúdo 
                  de nossos programas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">8. Modificações nos Termos</h2>
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  As alterações entrarão em vigor imediatamente após a publicação. O uso continuado 
                  dos serviços após modificações constitui aceitação dos novos termos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">9. Cancelamento e Suspensão</h2>
                <p>
                  Podemos suspender ou encerrar sua conta a qualquer momento, com ou sem aviso prévio, 
                  caso você viole estes Termos de Uso ou por qualquer outro motivo justificado. 
                  Você também pode solicitar o cancelamento de sua conta a qualquer momento.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">10. Legislação Aplicável</h2>
                <p>
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                  Qualquer disputa será resolvida no foro da Comarca de São Paulo, SP, com exclusão 
                  de qualquer outro, por mais privilegiado que seja.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-4">11. Contato</h2>
                <p>
                  Para dúvidas sobre estes Termos de Uso, entre em contato conosco:
                </p>
                <p className="mt-4">
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:contato@soberanamentoria.com.br" className="text-secondary hover:underline">
                    contato@soberanamentoria.com.br
                  </a>
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-background py-6">
          <div className="container-soberana px-4 text-center text-sm text-background/60">
            © {new Date().getFullYear()} Soberana Mentoring Club. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Termos;

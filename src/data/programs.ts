import { Bot, Calendar, Rocket, Star, Crown, LucideIcon } from "lucide-react";

// Program images
import programWorkshopIA from "@/assets/programs/program-workshop-ia.jpg";
import programExperienceStart from "@/assets/programs/program-experience-start.jpg";
import programAceleracao from "@/assets/programs/program-aceleracao.jpg";
import programMentoria360 from "@/assets/programs/program-mentoria-360.jpg";
import programElite from "@/assets/programs/program-elite.jpg";

export interface ProgramTestimonial {
  name: string;
  area: string;
  content: string;
  result?: string;
}

export interface ProgramFAQ {
  question: string;
  answer: string;
}

export interface Program {
  slug: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  impactPhrase: string;
  description: string;
  fullDescription: string;
  targetAudience: string[];
  format: string;
  duration?: string;
  location?: string;
  deliverables: string[];
  price?: string;
  ctaLink: string;
  ctaText: string;
  secondaryCta?: {
    link: string;
    text: string;
  };
  icon: LucideIcon;
  tier: "entry" | "mid" | "elite";
  featured?: boolean;
  image?: string;
  customPageUrl?: string;
  testimonials: ProgramTestimonial[];
  faq: ProgramFAQ[];
  modules?: {
    title: string;
    description: string;
  }[];
}

export const programs: Record<string, Program> = {
  "workshop-ia": {
    slug: "workshop-ia",
    title: "O acelerador tecnológico para o seu faturamento de +50k/mês",
    image: programWorkshopIA,
    titleHighlight: "+50k/mês",
    subtitle: "Workshop Soberana IA",
    impactPhrase: "O seu primeiro passo.",
    description: "Não se trata apenas de tecnologia, trata-se de liberdade e escala. Domine as Inteligências Artificiais treinadas especificamente para a advocacia imobiliária.",
    fullDescription: "Não se trata apenas de tecnologia, trata-se de liberdade e escala. Domine as Inteligências Artificiais treinadas especificamente para a advocacia imobiliária e:\n\nRecupere +10 horas da sua semana: Delegue o trabalho repetitivo e burocrático para a IA e foque no que realmente traz dinheiro: o fechamento de contratos.\n\nEstratégias de Elite: Use a IA para desenhar teses imobiliárias complexas, planos de negócios e estratégias de vendas em minutos.",
    targetAudience: [
      "Advogadas que buscam o faturamento de +50k/mês: E entenderam que o segredo não é trabalhar mais, mas trabalhar de forma inteligente",
      "Especialistas (ou futuras especialistas) em Direito Imobiliário: Que precisam de agilidade para analisar contratos e due diligence sem perder a qualidade técnica",
      "Profissionais sobrecarregadas: Que hoje não conseguem prospectar clientes de alto ticket porque estão presas na 'cozinha' do operacional",
      "Quem quer se diferenciar no mercado: Usando a IA como um diferencial competitivo para entregar resultados mais rápidos que a concorrência"
    ],
    format: "Workshop online com IAs exclusivas",
    duration: "Acesso imediato",
    deliverables: [
      "Acesso às minhas IAs Soberanas: Robôs treinados com minha experiência de 15 anos para pensar como uma advogada imobiliarista de elite",
      "Biblioteca de Prompts de Ouro: Comandos prontos para análise de riscos, elaboração de pareceres e petições imobiliárias em segundos",
      "Máquina de Conteúdo Imobiliário: Estratégias para usar a IA para atrair investidores e clientes que pagam bem, sem precisar ser escrava do Instagram"
    ],
    ctaLink: "https://wa.me/5511993563468?text=Olá! Quero saber mais sobre o Workshop Soberana IA",
    ctaText: "Saiba Mais Sobre o Workshop",
    icon: Bot,
    tier: "entry",
    modules: [
      { title: "Módulo 1: Mentalidade Soberana e IA", description: "Como a tecnologia é a base para o seu novo faturamento" },
      { title: "Módulo 2: O Cérebro Digital", description: "Domine os prompts que executam o trabalho de um estagiário sênior em segundos" },
      { title: "Módulo 3: Operação Escalável", description: "Automatize o Direito Imobiliário (Contratos e Due Diligence) e libere sua agenda para vender" },
      { title: "Módulo 4: Ímã de Clientes", description: "Use a IA para criar funis de vendas e conteúdos que posicionam você como a autoridade número 1" }
    ],
    testimonials: [
      {
        name: "Dra. Amanda Ferreira",
        area: "Direito Imobiliário",
        content: "Economizo pelo menos 2 horas por dia usando as IAs da Fabiana. Minha produtividade triplicou!",
        result: "6h economizadas por semana"
      },
      {
        name: "Dra. Patrícia Lima",
        area: "Direito Imobiliário",
        content: "Com as IAs da Fabiana, parei de redigir contratos do zero. Esse tempo que sobrou eu usei para fazer reuniões de prospecção e fechei meu primeiro contrato de R$ 15k no mês.",
        result: "R$ 15k em novos contratos"
      }
    ],
    faq: [
      {
        question: "Preciso saber usar IA para fazer o workshop?",
        answer: "Não! O workshop começa do zero e te ensina tudo passo a passo."
      },
      {
        question: "As IAs funcionam para qualquer área do Direito?",
        answer: "As IAs foram treinadas especificamente para a advocacia imobiliária, com foco em contratos, due diligence e teses complexas."
      },
      {
        question: "Estou começando do zero no Imobiliário, a IA serve para mim?",
        answer: "Com certeza. A IA encurta sua curva de aprendizado e execução. Ela te dá a segurança técnica que você precisaria de anos para adquirir, permitindo que você já comece cobrando honorários de especialista."
      },
      {
        question: "Por quanto tempo tenho acesso?",
        answer: "Acesso vitalício ao conteúdo e às atualizações futuras."
      }
    ]
  },
  "experience-start": {
    slug: "experience-start",
    title: "Networking e estratégia presencial em um dia exclusivo",
    titleHighlight: "em um dia exclusivo",
    image: programExperienceStart,
    subtitle: "Soberana Experience Start",
    customPageUrl: "/experience-start",
    impactPhrase: "O despertar em SP.",
    description: "Oficinas presenciais personalíssimas em São Paulo para apenas 12 mulheres. Um dia de imersão prática para destravar sua visão de negócio.",
    fullDescription: "O Soberana Experience Start é uma oficina presencial exclusiva em São Paulo, limitada a apenas 12 advogadas. Um dia intensivo de imersão prática para destravar sua visão de negócio, com networking de alto nível e estratégias aplicáveis imediatamente.",
    targetAudience: [
      "Advogadas que valorizam experiências presenciais",
      "Profissionais que querem networking de qualidade",
      "Quem precisa destravar sua visão de negócio",
      "Advogadas em busca de clareza e direção"
    ],
    format: "Oficina Presencial - 1 dia",
    duration: "1 dia intensivo",
    location: "São Paulo, SP",
    price: "",
    deliverables: [
      "1 dia de imersão presencial em São Paulo",
      "Oficinas práticas e mão na massa",
      "Networking com 12 advogadas selecionadas",
      "Material exclusivo do evento",
      "Plano de ação personalizado"
    ],
    ctaLink: "https://form.typeform.com/to/WcPbnyhP",
    ctaText: "Ver Próximas Datas em SP",
    icon: Calendar,
    tier: "entry",
    modules: [
      { title: "Destravando sua Visão", description: "Clareza sobre seu negócio jurídico e objetivos" },
      { title: "Networking Estratégico", description: "Construa conexões de valor com outras advogadas" },
      { title: "Plano de Ação", description: "Saia com passos concretos para implementar" }
    ],
    testimonials: [
      {
        name: "Dra. Mariana Costa",
        area: "Direito de Família",
        content: "O dia mais produtivo que já tive! Saí com clareza total e já fiz 3 parcerias incríveis.",
        result: "3 parcerias fechadas"
      },
      {
        name: "Dra. Juliana Santos",
        area: "Direito Trabalhista",
        content: "Investimento muito acessível para o valor que entrega. Vale cada centavo!",
        result: "Clareza total do negócio"
      }
    ],
    faq: [
      {
        question: "Onde acontece em São Paulo?",
        answer: "O local é informado após a confirmação da inscrição. Sempre em espaços premium e de fácil acesso."
      },
      {
        question: "Quantas pessoas participam?",
        answer: "Limitamos a 12 participantes para garantir qualidade nas conexões e atenção personalizada."
      },
      {
        question: "Com que frequência acontece?",
        answer: "Realizamos edições mensais. Confira as próximas datas disponíveis."
      }
    ]
  },
  "aceleracao": {
    slug: "aceleracao",
    title: "Estruture sua advocacia em 90 dias",
    titleHighlight: "em 90 dias",
    image: programAceleracao,
    subtitle: "Programa de Aceleração Soberana",
    impactPhrase: "A fundação do seu escritório lucrativo.",
    description: "Mentoria em grupo focada nos 6 pilares: Mentalidade, Posicionamento, Marketing, Vendas, Precificação e Gestão.",
    fullDescription: "O Programa de Aceleração é a mentoria em grupo de 90 dias para advogadas que querem sair do caos e estruturar um negócio jurídico organizado e lucrativo. Trabalhamos os 6 pilares fundamentais da Metodologia Soberana para você construir uma base sólida.",
    targetAudience: [
      "Advogadas iniciantes que querem começar certo",
      "Profissionais em transição de carreira",
      "Quem trabalha de forma desorganizada",
      "Advogadas que faturam mas não lucram"
    ],
    format: "Mentoria em grupo - 90 dias",
    duration: "3 meses",
    deliverables: [
      "6 encontros quinzenais ao vivo",
      "Os 6 pilares: Mentalidade, Posicionamento, Marketing, Vendas, Precificação e Gestão",
      "Scripts de Vendas prontos para usar",
      "Sistema de Gestão com Auralex",
      "Comunidade exclusiva de alunas",
      "Materiais de apoio e templates"
    ],
    ctaLink: "https://wa.me/5511993563468?text=Olá! Quero saber mais sobre o Programa de Aceleração Soberana",
    ctaText: "Quero Estruturar Meu Negócio",
    icon: Rocket,
    tier: "mid",
    modules: [
      { title: "Pilar 1: Mentalidade", description: "Desenvolva a mentalidade de empresária jurídica" },
      { title: "Pilar 2: Posicionamento", description: "Defina seu nicho e diferencial no mercado" },
      { title: "Pilar 3: Marketing", description: "Atraia clientes de forma consistente" },
      { title: "Pilar 4: Vendas", description: "Converta consultas em contratos" },
      { title: "Pilar 5: Precificação", description: "Cobre o que você vale" },
      { title: "Pilar 6: Gestão", description: "Organize processos e escale" }
    ],
    testimonials: [
      {
        name: "Dra. Carolina Mendes",
        area: "Direito Previdenciário",
        content: "Em 90 dias estruturei completamente meu escritório. Saí do caos para um negócio organizado.",
        result: "Faturamento dobrou em 90 dias"
      },
      {
        name: "Dra. Renata Alves",
        area: "Direito de Família",
        content: "Os scripts de vendas são ouro! Minha taxa de conversão subiu de 20% para 60%.",
        result: "3x mais contratos fechados"
      }
    ],
    faq: [
      {
        question: "Qual o formato dos encontros?",
        answer: "São 6 encontros quinzenais ao vivo via Zoom, sempre com gravação disponível."
      },
      {
        question: "Posso participar se já tenho escritório há anos?",
        answer: "Sim! O programa serve tanto para iniciantes quanto para quem quer reorganizar o negócio."
      },
      {
        question: "O que é o Auralex?",
        answer: "É um sistema de gestão jurídica que ensinamos a usar para organizar sua rotina e processos."
      }
    ]
  },
  "mentoria-360": {
    slug: "mentoria-360",
    title: "Eu percorro o caminho com você",
    titleHighlight: "com você",
    image: programMentoria360,
    subtitle: "Mentoria Soberana 360°",
    impactPhrase: "Acompanhamento semestral de elite.",
    description: "Na Mentoria Soberana 360°, você não recebe apenas orientação. Você implementa com acompanhamento direto, decisões estratégicas e estrutura para escalar com segurança e lucro.",
    fullDescription: "A Mentoria Soberana 360° é meu programa de acompanhamento semestral para advogadas que querem escalar seu escritório com posicionamento premium, tráfego pago e autoridade digital. O diferencial? Eu não apenas ensino: eu implemento junto com você.",
    targetAudience: [
      "Advogadas que já têm base estruturada",
      "Quem quer escalar com tráfego pago",
      "Profissionais que buscam autoridade digital",
      "Escritórios que querem crescer de forma sustentável"
    ],
    format: "Mentoria Premium - 6 meses",
    duration: "6 meses",
    deliverables: [
      "6 meses de acompanhamento estratégico",
      "Setup de Tráfego Pago feito por mim",
      "Eu configuro suas campanhas de anúncios ao seu lado",
      "Encontros mensais individuais e em grupo",
      "Comunidade exclusiva de mentoradas",
      "Suporte prioritário via WhatsApp"
    ],
    ctaLink: "https://wa.me/5511993563468?text=Olá! Quero aplicar para a Mentoria Soberana 360°",
    ctaText: "Aplicar para a Mentoria 360°",
    icon: Star,
    tier: "mid",
    featured: true,
    modules: [
      { title: "Diagnóstico do Negócio", description: "Análise completa da sua situação atual" },
      { title: "Estratégia de Posicionamento", description: "Defina seu diferencial premium no mercado" },
      { title: "Setup de Tráfego Pago", description: "Configuração das campanhas de anúncios" },
      { title: "Autoridade Digital", description: "Construa presença online de impacto" },
      { title: "Escala e Crescimento", description: "Estratégias para crescer de forma sustentável" }
    ],
    testimonials: [
      {
        name: "Dra. Fernanda Rocha",
        area: "Direito Imobiliário",
        content: "A Fabiana configurou meu tráfego pago e em 3 meses já tinha recuperado o investimento da mentoria.",
        result: "ROI de 400% em 3 meses"
      },
      {
        name: "Dra. Beatriz Cardoso",
        area: "Direito Trabalhista",
        content: "Ter a Fabiana implementando junto faz toda diferença. Não é teoria, é resultado na prática.",
        result: "De 5 para 25 clientes/mês"
      }
    ],
    faq: [
      {
        question: "O que significa 'Setup de Tráfego Pago feito pela Fabiana'?",
        answer: "Eu pessoalmente configuro suas campanhas de anúncios no Meta Ads (Facebook e Instagram), desde a estratégia até a configuração técnica."
      },
      {
        question: "Preciso ter faturamento mínimo para participar?",
        answer: "Recomendamos que você já tenha uma base de clientes e faturamento para aproveitar ao máximo."
      },
      {
        question: "Como funciona o processo de aplicação?",
        answer: "Você preenche o formulário de aplicação, agendamos uma call de alinhamento e, se houver fit, você recebe a proposta."
      }
    ]
  },
  "elite": {
    slug: "elite",
    title: "O próximo nível da liderança jurídica",
    titleHighlight: "liderança jurídica",
    image: programElite,
    subtitle: "Soberana Elite Mastermind Anual",
    impactPhrase: "Para quem lidera impérios.",
    description: "Este Mastermind é para quem já venceu etapas, mas entende que o próximo nível não se alcança sozinha, nem no improviso. Aqui, decisões são estratégicas, movimentos são conscientes e o crescimento é sustentável.",
    fullDescription: "O Mastermind Soberana Elite é um acompanhamento exclusivo de 12 meses para advogadas que já estruturaram a base e agora buscam consolidação de marca, gestão de equipe e crescimento a longo prazo. Foco total em escala, liderança de associados, cultura empresarial e networking premium.",
    targetAudience: [
      "Graduadas da Mentoria 360° ou equivalente",
      "Escritórios consolidados que buscam networking",
      "Advogadas que lideram equipes",
      "Quem busca projetos de alto nível e ambiência premium"
    ],
    format: "Mastermind Anual - 12 meses",
    duration: "12 meses",
    deliverables: [
      "12 meses de acompanhamento: presença estratégica da Fabiana no seu negócio",
      "Conselho Consultivo: reuniões mensais para resolução de desafios de gestão e escala",
      "O Retiro Soberano: experiência presencial VIP de imersão e networking de alto padrão",
      "Suporte Prioritário: acesso direto à mentora para decisões críticas"
    ],
    ctaLink: "https://wa.me/5511993563468?text=Olá! Quero saber sobre o Mastermind Soberana Elite",
    ctaText: "Consultar Condições de Admissão",
    icon: Crown,
    tier: "elite",
    featured: true,
    modules: [
      { title: "Conselho Consultivo", description: "Reuniões mensais de estratégia e resolução de desafios" },
      { title: "Gestão de Equipe", description: "Lidere associados com excelência e eficiência" },
      { title: "Cultura Empresarial", description: "Construa um escritório com valores e propósito" },
      { title: "Escala Avançada", description: "Estratégias de alto crescimento sustentável" },
      { title: "Retiro Soberano", description: "Imersão VIP de planejamento estratégico" }
    ],
    testimonials: [
      {
        name: "Dra. Gabriela Nunes",
        area: "Direito Empresarial",
        content: "O Mastermind Elite mudou o patamar do meu escritório. O networking e o conselho consultivo são impagáveis.",
        result: "Escritório com 5 associados"
      },
      {
        name: "Dra. Tatiana Moraes",
        area: "Direito Tributário",
        content: "O Retiro Soberano foi a experiência mais transformadora. Planejamento estratégico de verdade.",
        result: "Faturamento 7 dígitos"
      }
    ],
    faq: [
      {
        question: "Preciso ter passado pela Mentoria 360°?",
        answer: "Não é obrigatório, mas damos preferência para graduadas da 360° ou escritórios já consolidados."
      },
      {
        question: "O que é o Retiro Soberano?",
        answer: "É um encontro presencial VIP de planejamento estratégico e networking de alto padrão, exclusivo para participantes do Elite."
      },
      {
        question: "Como funciona o Conselho Consultivo?",
        answer: "Reuniões mensais em grupo para discutir desafios de gestão, escala e decisões estratégicas com minha mentoria direta."
      }
    ]
  }
};

export const programsList = Object.values(programs);

export const getProgramBySlug = (slug: string): Program | undefined => {
  return programs[slug];
};

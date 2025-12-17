import { Bot, Sparkles, Rocket, Target, UtensilsCrossed, Crown, LucideIcon } from "lucide-react";

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
  tier: "entry" | "mid" | "presencial";
  featured?: boolean;
  testimonials: ProgramTestimonial[];
  faq: ProgramFAQ[];
  modules?: {
    title: string;
    description: string;
  }[];
}

export const programs: Record<string, Program> = {
  "imersao-virada": {
    slug: "imersao-virada",
    title: "Imersão Virada Soberana",
    subtitle: "Desbloqueie sua visão estratégica",
    impactPhrase: "Clareza e direção para dar o primeiro passo.",
    description: "Ideal para quem precisa de clareza, direção e impulso para recomeçar com estratégia na advocacia.",
    fullDescription: "A Imersão Virada Soberana é o ponto de partida para advogadas que estão perdidas, estagnadas ou em transição de carreira. Em uma aula prática e transformadora, você vai desbloquear sua visão estratégica e sair com um plano de ação claro para os próximos 90 dias.",
    targetAudience: [
      "Advogadas que se sentem perdidas na carreira",
      "Profissionais em transição de área",
      "Quem precisa de clareza para dar o primeiro passo",
      "Advogadas que querem sair da estagnação"
    ],
    format: "Aula online gravada",
    duration: "Imersão de 1 dia",
    deliverables: [
      "Acesso imediato ao conteúdo completo",
      "Material de apoio em PDF",
      "Exercícios práticos de autoconhecimento",
      "Plano de ação para 90 dias",
      "Certificado de conclusão"
    ],
    ctaLink: "https://soberanamentoria.com.br/imersao-virada",
    ctaText: "Quero Participar da Imersão",
    icon: Sparkles,
    tier: "entry",
    testimonials: [
      {
        name: "Dra. Mariana Costa",
        area: "Direito de Família",
        content: "A imersão me deu a clareza que eu precisava. Saí com um plano de ação concreto e já comecei a implementar.",
        result: "Primeiro cliente em 15 dias"
      },
      {
        name: "Dra. Juliana Santos",
        area: "Direito Trabalhista",
        content: "Estava completamente perdida na carreira. A virada soberana literalmente virou minha chave mental.",
        result: "Transição de carreira bem-sucedida"
      }
    ],
    faq: [
      {
        question: "Por quanto tempo tenho acesso ao conteúdo?",
        answer: "Você tem acesso vitalício ao conteúdo da imersão, podendo assistir quantas vezes quiser."
      },
      {
        question: "Preciso ter experiência em negócios?",
        answer: "Não! A imersão foi criada justamente para quem está começando e precisa de clareza."
      },
      {
        question: "Recebo certificado?",
        answer: "Sim, ao concluir a imersão você recebe um certificado digital de participação."
      }
    ]
  },
  "ia-soberana": {
    slug: "ia-soberana",
    title: "Inteligência Artificial Soberana",
    subtitle: "Sua Advocacia Potencializada por IA",
    impactPhrase: "Ganhe tempo e autoridade com tecnologia.",
    description: "Domine as Inteligências Artificiais treinadas para advocacia. Recupere horas da sua semana com ajuda da IA.",
    fullDescription: "O curso Inteligência Artificial Soberana foi desenvolvido para advogadas que querem usar a tecnologia a seu favor. Você vai aprender a usar IAs treinadas especificamente para a advocacia, automatizando tarefas repetitivas e ganhando tempo para focar no que realmente importa: seus clientes e seu crescimento.",
    targetAudience: [
      "Advogadas que querem ganhar tempo com automação",
      "Profissionais que buscam se diferenciar com tecnologia",
      "Quem quer produzir conteúdo de qualidade rapidamente",
      "Advogadas que querem modernizar seu escritório"
    ],
    format: "Curso online com IAs exclusivas",
    duration: "Acesso imediato",
    deliverables: [
      "Acesso às IAs treinadas para advocacia",
      "Biblioteca de Prompts exclusivos",
      "Automações para rotinas jurídicas",
      "Templates de conteúdo para redes sociais",
      "Suporte na comunidade",
      "Atualizações constantes"
    ],
    ctaLink: "https://soberanamentoria.curseduca.pro/c/ia-para-advogadas-1754318820421",
    ctaText: "Acessar o Curso de IA",
    icon: Bot,
    tier: "entry",
    testimonials: [
      {
        name: "Dra. Amanda Ferreira",
        area: "Direito Imobiliário",
        content: "Economizo pelo menos 2 horas por dia usando as IAs da Fabiana. Minha produtividade triplicou!",
        result: "6h economizadas por semana"
      },
      {
        name: "Dra. Patrícia Lima",
        area: "Direito Empresarial",
        content: "Os prompts são incríveis! Consigo produzir conteúdo para o Instagram em minutos.",
        result: "3x mais conteúdo produzido"
      }
    ],
    faq: [
      {
        question: "Preciso saber usar IA para fazer o curso?",
        answer: "Não! O curso começa do zero e te ensina tudo passo a passo."
      },
      {
        question: "As IAs funcionam para qualquer área do Direito?",
        answer: "Sim! Temos IAs treinadas para diversas áreas: cível, trabalhista, família, imobiliário, etc."
      },
      {
        question: "Por quanto tempo tenho acesso?",
        answer: "Acesso vitalício ao curso e às atualizações futuras."
      }
    ]
  },
  "aceleracao": {
    slug: "aceleracao",
    title: "Programa de Aceleração Soberana",
    subtitle: "Estruture sua advocacia em 90 dias",
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
    ctaLink: "https://form.typeform.com/to/WcPbnyhP",
    ctaText: "Inscreva-se no Programa",
    secondaryCta: {
      link: "https://wa.me/5511993563468?text=Olá! Quero saber mais sobre o Programa de Aceleração",
      text: "Falar com a Equipe"
    },
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
  "mentoria-anual": {
    slug: "mentoria-anual",
    title: "Mentoria Soberana Anual",
    subtitle: "Escale seu escritório com acompanhamento de elite",
    impactPhrase: "Eu percorro o caminho com você.",
    description: "O acompanhamento de elite para quem quer escala. Aqui eu não apenas ensino, eu implemento junto com você.",
    fullDescription: "A Mentoria Soberana Anual é meu programa mais completo de acompanhamento. Durante 12 meses, trabalho lado a lado com você para escalar seu escritório com posicionamento premium, tráfego pago e autoridade digital. Aqui eu não apenas ensino: eu implemento junto com você.",
    targetAudience: [
      "Advogadas que já têm base estruturada",
      "Quem quer escalar com tráfego pago",
      "Profissionais que buscam autoridade digital",
      "Escritórios que querem crescer de forma sustentável"
    ],
    format: "Mentoria Premium - 12 meses",
    duration: "1 ano",
    deliverables: [
      "12 meses de acompanhamento estratégico",
      "Setup de Tráfego Pago feito pela Fabiana",
      "Configuração completa de campanhas de anúncios",
      "Encontros mensais individuais e em grupo",
      "Comunidade exclusiva de mentoradas",
      "Suporte prioritário via WhatsApp",
      "Acesso a todos os outros programas"
    ],
    ctaLink: "https://form.typeform.com/to/WcPbnyhP",
    ctaText: "Aplicar para a Mentoria",
    secondaryCta: {
      link: "https://wa.me/5511993563468?text=Olá! Quero aplicar para a Mentoria Soberana Anual",
      text: "Conversar com a Fabiana"
    },
    icon: Target,
    tier: "mid",
    featured: true,
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
        answer: "Recomendamos que você já tenha uma base de clientes e faturamento mínimo de R$ 10k/mês para aproveitar ao máximo."
      },
      {
        question: "Como funciona o processo de aplicação?",
        answer: "Você preenche o formulário de aplicação, agendamos uma call de alinhamento e, se houver fit, você recebe a proposta."
      }
    ]
  },
  "jantar-soberano": {
    slug: "jantar-soberano",
    title: "Jantar Soberano",
    subtitle: "Networking de alto nível",
    impactPhrase: "Networking, estratégia e experiência exclusiva.",
    description: "Encontro presencial exclusivo com talk estratégico e dinâmicas de negócios para advogadas que querem conexões de valor.",
    fullDescription: "O Jantar Soberano é um evento presencial exclusivo para advogadas que entendem o poder do networking de qualidade. Uma noite de conexões estratégicas, talk inspirador e dinâmicas de negócios em um ambiente sofisticado.",
    targetAudience: [
      "Advogadas que valorizam networking presencial",
      "Profissionais que buscam parcerias estratégicas",
      "Quem quer expandir sua rede de contatos",
      "Advogadas que investem em relacionamentos"
    ],
    format: "Evento Presencial",
    duration: "Uma noite",
    location: "São Paulo, SP",
    deliverables: [
      "Jantar em restaurante exclusivo",
      "Talk estratégico com Fabiana Duarte",
      "Dinâmicas de networking estruturado",
      "Material exclusivo do evento",
      "Conexões com advogadas de alto nível"
    ],
    ctaLink: "https://form.typeform.com/to/WcPbnyhP",
    ctaText: "Entrar na Lista de Espera",
    secondaryCta: {
      link: "https://wa.me/5511993563468?text=Olá! Quero saber sobre as próximas datas do Jantar Soberano",
      text: "Ver Próximas Datas"
    },
    icon: UtensilsCrossed,
    tier: "presencial",
    testimonials: [
      {
        name: "Dra. Luciana Martins",
        area: "Direito Empresarial",
        content: "Fechei duas parcerias estratégicas no jantar. O networking é real e de altíssimo nível.",
        result: "2 parcerias fechadas"
      },
      {
        name: "Dra. Isabela Costa",
        area: "Direito Tributário",
        content: "A energia do evento é incrível. Saí inspirada e com contatos valiosos na minha área.",
        result: "Rede de contatos expandida"
      }
    ],
    faq: [
      {
        question: "Onde acontece o Jantar Soberano?",
        answer: "Os jantares acontecem em restaurantes selecionados em São Paulo. O local exato é informado após a confirmação."
      },
      {
        question: "Quantas pessoas participam?",
        answer: "Limitamos a 12 participantes para garantir qualidade nas conexões e intimidade no evento."
      },
      {
        question: "Com que frequência acontece?",
        answer: "Realizamos jantares trimestrais. Entre na lista de espera para ser avisada das próximas datas."
      }
    ]
  },
  "experiencia-soberana": {
    slug: "experiencia-soberana",
    title: "Experiência Soberana",
    subtitle: "Imersão presencial transformadora",
    impactPhrase: "Viva a transformação da sua identidade jurídica.",
    description: "Evento imersivo de dois dias com vivências, mentorias ao vivo e rituais de liderança para advogadas que querem transformação profunda.",
    fullDescription: "A Experiência Soberana é uma imersão presencial de 2 dias para advogadas que estão prontas para uma transformação profunda. Vivências intensas, mentorias ao vivo, rituais de liderança e muito networking em um ambiente premium.",
    targetAudience: [
      "Advogadas prontas para transformação profunda",
      "Quem busca experiências transformadoras",
      "Profissionais que valorizam vivências presenciais",
      "Advogadas comprometidas com seu crescimento"
    ],
    format: "Imersão Presencial - 2 dias",
    duration: "2 dias intensivos",
    location: "A definir",
    deliverables: [
      "2 dias de imersão presencial completa",
      "Vivências transformadoras e dinâmicas",
      "Mentorias ao vivo com Fabiana",
      "Rituais de liderança e empoderamento",
      "Networking com advogadas extraordinárias",
      "Material exclusivo e certificado",
      "Coffee break e almoço inclusos"
    ],
    ctaLink: "https://form.typeform.com/to/WcPbnyhP",
    ctaText: "Entrar na Lista de Espera",
    secondaryCta: {
      link: "https://wa.me/5511993563468?text=Olá! Quero saber mais sobre a Experiência Soberana",
      text: "Saber Mais"
    },
    icon: Crown,
    tier: "presencial",
    testimonials: [
      {
        name: "Dra. Gabriela Nunes",
        area: "Direito Civil",
        content: "Foi a experiência mais transformadora que já tive na advocacia. Saí renovada e com clareza total.",
        result: "Virada de chave total"
      },
      {
        name: "Dra. Tatiana Moraes",
        area: "Direito de Família",
        content: "Os dois dias mais intensos e valiosos do ano. A Fabiana entrega muito mais do que promete.",
        result: "Triplicou o faturamento em 6 meses"
      }
    ],
    faq: [
      {
        question: "Onde acontece a Experiência Soberana?",
        answer: "O local varia a cada edição. Sempre em espaços premium e de fácil acesso."
      },
      {
        question: "Hospedagem está inclusa?",
        answer: "Não, a hospedagem é por conta da participante. Enviamos sugestões de hotéis próximos."
      },
      {
        question: "Posso participar sem ter feito outros programas?",
        answer: "Sim! A Experiência é aberta para todas as advogadas que desejam transformação."
      }
    ]
  }
};

export const programsList = Object.values(programs);

export const getProgramBySlug = (slug: string): Program | undefined => {
  return programs[slug];
};

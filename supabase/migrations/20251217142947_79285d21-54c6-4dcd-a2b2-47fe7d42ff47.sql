-- Insert 6 message templates for leads
INSERT INTO public.message_templates (name, description, target_audience, icon, email_subject, email_body, whatsapp_message, display_order, is_active)
VALUES 
  (
    'Primeiro Contato',
    'Mensagem de boas-vindas para novos leads',
    'lead',
    '👋',
    'Bem-vinda ao Soberana Mentoring Club, {{nome}}!',
    'Olá {{nome}},

Que alegria ter você por aqui! 🌟

Sou Fabiana Duarte e notei que você demonstrou interesse em transformar sua carreira na advocacia.

O Soberana Mentoring Club nasceu para ajudar advogadas como você a construir uma prática jurídica próspera e equilibrada.

Gostaria de saber: qual é o seu maior desafio hoje na advocacia?

Estou aqui para ajudar!

Com carinho,
Fabiana Duarte
Soberana Mentoring Club',
    'Olá {{nome}}! 👋

Aqui é a Fabiana do Soberana Mentoring Club.

Notei seu interesse em nosso conteúdo e queria te dar as boas-vindas!

Qual é o maior desafio que você enfrenta hoje na sua prática jurídica?

Adoraria conversar com você! 💜',
    1,
    true
  ),
  (
    'Aquecimento',
    'Envio de conteúdo de valor para nutrir o lead',
    'lead',
    '🔥',
    '{{nome}}, um presente especial para você!',
    'Olá {{nome}},

Preparei um conteúdo especial pensando em advogadas que querem se destacar no mercado.

📚 **Dica de ouro desta semana:**
A maior diferença entre advogadas bem-sucedidas e as que ficam estagnadas é a mentalidade de crescimento.

Enquanto umas reclamam da concorrência, outras estão construindo autoridade e atraindo clientes ideais.

Quer saber como fazer isso? Tenho um material exclusivo que pode te ajudar!

Responda este e-mail e eu envio para você.

Abraços,
Fabiana Duarte',
    'Oi {{nome}}! 🔥

Tudo bem?

Preparei um conteúdo especial sobre como atrair clientes ideais na advocacia.

Quer receber? É gratuito!

Só me responder aqui que eu envio 📩',
    2,
    true
  ),
  (
    'Agendar Conversa',
    'Convite para uma conversa estratégica',
    'lead',
    '📞',
    '{{nome}}, vamos conversar sobre sua advocacia?',
    'Olá {{nome}},

Tenho acompanhado sua jornada e percebi que você está buscando crescimento na advocacia.

Gostaria de te convidar para uma **conversa estratégica gratuita** de 30 minutos comigo.

Nessa conversa, vamos:
✅ Entender seu momento atual
✅ Identificar oportunidades de crescimento
✅ Traçar um plano personalizado para você

É sem compromisso e sem pressão. Meu objetivo é genuinamente ajudar.

Clique aqui para agendar: [LINK]

Te vejo em breve?

Abraços,
Fabiana Duarte',
    'Oi {{nome}}! 📞

Estava pensando em você...

Que tal uma conversa rápida para entender melhor seus objetivos e ver como posso te ajudar?

30 minutinhos, sem compromisso!

Posso te mandar o link para agendar? 📅',
    3,
    true
  ),
  (
    'Oferta Especial',
    'Apresentação de oferta com condição especial',
    'lead',
    '💎',
    '{{nome}}, condição especial para você!',
    'Olá {{nome}},

Tenho uma novidade especial para você!

Estou abrindo novas vagas para a **Mentoria Soberana** com uma condição exclusiva para quem está na minha lista.

O que você vai ter acesso:
🏆 Mentoria em grupo semanal
📚 Biblioteca de cursos completa  
👥 Comunidade exclusiva de advogadas
🎯 Plano de ação personalizado
📞 Suporte direto comigo

**Condição especial:** 20% de desconto para fechar até sexta-feira!

Essa é a oportunidade de transformar sua advocacia de vez.

Quer saber mais detalhes? Responda este e-mail!

Abraços,
Fabiana Duarte',
    'Oi {{nome}}! 💎

Tenho uma condição especial para você!

Estou abrindo vagas para a Mentoria Soberana com 20% OFF esta semana.

Quer que eu te explique como funciona?

É a chance de transformar sua advocacia! ✨',
    4,
    true
  ),
  (
    'Última Chamada',
    'Urgência para fechamento com prazo',
    'lead',
    '⏰',
    '{{nome}}, últimas horas para garantir sua vaga!',
    'Olá {{nome}},

Este é um lembrete importante!

A condição especial que te ofereci está expirando em **24 horas**.

Depois desse prazo, o valor volta ao normal e não sei quando teremos outra oportunidade assim.

Sei que decisões importantes precisam de tempo, mas às vezes a procrastinação nos impede de alcançar nossos sonhos.

Se você quer:
✅ Atrair mais clientes
✅ Ter previsibilidade financeira
✅ Construir autoridade no mercado
✅ Ter equilíbrio entre vida pessoal e profissional

Este é o momento!

Garanta sua vaga agora: [LINK]

Última chamada!

Abraços,
Fabiana Duarte',
    'Oi {{nome}}! ⏰

Últimas horas para garantir a condição especial!

Depois de amanhã, o desconto não estará mais disponível.

Quer garantir sua vaga?

Me responde que te passo os detalhes! 🚀',
    5,
    true
  ),
  (
    'Reativação',
    'Reconquistar leads inativos',
    'lead',
    '💔',
    '{{nome}}, sentimos sua falta!',
    'Olá {{nome}},

Faz um tempinho que não conversamos e eu fiquei pensando em você.

Sei que a rotina de advogada é corrida e que às vezes a gente deixa os planos de lado.

Mas eu acredito muito no seu potencial, {{nome}}.

Quando você demonstrou interesse no Soberana, eu vi que você tem vontade de crescer e fazer diferente.

Esse desejo ainda existe?

Se sim, estou aqui para ajudar. Responda este e-mail e vamos retomar essa conversa!

Com carinho,
Fabiana Duarte

P.S.: Sem pressão, ok? Só quero saber se você está bem e se posso ajudar de alguma forma.',
    'Oi {{nome}}! 💔

Faz um tempo que não conversamos...

Tudo bem por aí?

Lembrei de você e queria saber se ainda tem interesse em transformar sua advocacia.

Se quiser retomar nossa conversa, estou aqui!

Com carinho 💜',
    6,
    true
  );
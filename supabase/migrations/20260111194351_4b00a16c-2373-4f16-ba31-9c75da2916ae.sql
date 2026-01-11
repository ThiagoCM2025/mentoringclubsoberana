-- Add source_filter column to nurturing_sequences
ALTER TABLE nurturing_sequences ADD COLUMN IF NOT EXISTS source_filter text DEFAULT NULL;

-- Insert Jornada Imobiliária 2026 nurturing sequences
INSERT INTO nurturing_sequences (step_number, name, delay_hours, email_subject, email_body, is_active, source_filter)
VALUES 
  (101, 'Jornada - Boas-vindas', 0, 
   '🎯 Sua inscrição foi confirmada! Jornada Imobiliária começa dia 12/01', 
   'Olá {nome}!

Parabéns pela sua decisão de transformar sua advocacia imobiliária!

Sua inscrição na **Jornada Imobiliária 2026** está confirmada. 🎉

📅 **Agenda dos encontros (todos às 20h):**

• **12/01 (Segunda)** - Rotina e Processos
• **15/01 (Quinta)** - Captação Estratégica  
• **19/01 (Segunda)** - Inteligência Artificial
• **22/01 (Quinta)** - Precificação de Elite
• **26/01 (Segunda)** - Conversão de Vendas

Prepare-se para 5 encontros que vão revolucionar a forma como você trabalha.

Te vejo no dia 12! 💪

**Fabiana Calçados de Souza**
Mentora Soberana', 
   true, 'jornada_imobiliaria_2026'),

  (102, 'Jornada - Lembrete 24h antes', 24, 
   '⏰ Amanhã começa! Jornada Imobiliária às 20h', 
   'Olá {nome}!

Amanhã é o grande dia! 🚀

A Jornada Imobiliária 2026 começa às 20h com nosso primeiro encontro sobre **Rotina e Processos**.

Você vai aprender como organizar sua rotina para escalar no Direito Imobiliário sem surtar.

📌 **Prepare-se:**
- Tenha papel e caneta à mão
- Esteja em um ambiente tranquilo
- Venha com mente aberta para novas estratégias

Esse é o primeiro passo para transformar sua advocacia.

Até amanhã! 💫

**Fabiana Calçados de Souza**', 
   true, 'jornada_imobiliaria_2026'),

  (103, 'Jornada - Engajamento dia 2', 72, 
   '📊 Como foi o primeiro encontro? Suas dúvidas são bem-vindas!', 
   'Olá {nome}!

Como você está aplicando o que aprendeu sobre Rotina e Processos?

Nosso próximo encontro é dia **15/01 às 20h** sobre **Captação Estratégica**.

Você vai descobrir o passo a passo para fechar contratos com clientes qualificados sem depender de indicações.

💡 **Dica:** Revise suas anotações do primeiro encontro e anote suas principais dúvidas para a próxima aula.

Qualquer dúvida, responda este e-mail!

Até quinta! 🎯

**Fabiana Calçados de Souza**', 
   true, 'jornada_imobiliaria_2026'),

  (104, 'Jornada - Metade da jornada', 168, 
   '🔥 Já estamos na metade! IA para advogadas amanhã', 
   'Olá {nome}!

Você chegou na metade da Jornada Imobiliária! 🎉

Amanhã, dia **19/01 às 20h**, vamos falar sobre **Inteligência Artificial** aplicada ao Direito Imobiliário.

Esse é um dos encontros mais aguardados! Você vai aprender como usar IA para ganhar tempo real no seu escritório.

📈 **Até aqui você aprendeu:**
✅ Como organizar rotina e processos
✅ Estratégias de captação de clientes

📅 **Ainda vem por aí:**
• Precificação de Elite (22/01)
• Conversão de Vendas (26/01)

Continue firme! Os melhores resultados estão por vir.

**Fabiana Calçados de Souza**', 
   true, 'jornada_imobiliaria_2026'),

  (105, 'Jornada - Último encontro', 336, 
   '🏆 Último encontro amanhã! Conversão de Vendas', 
   'Olá {nome}!

Chegou a hora do GRANDE FINAL! 🏆

Amanhã, **26/01 às 20h**, teremos nosso último encontro: **Conversão de Vendas**.

Você vai aprender como transformar meras consultas em contratos de alto valor.

Durante toda a Jornada, você construiu as bases:
✅ Rotina organizada
✅ Captação estratégica  
✅ IA como aliada
✅ Precificação inteligente

Agora é hora de fechar o ciclo e dominar a conversão!

Não perca esse encontro por nada. É o momento de consolidar toda a transformação.

Até amanhã! 💪

**Fabiana Calçados de Souza**', 
   true, 'jornada_imobiliaria_2026')
ON CONFLICT DO NOTHING;
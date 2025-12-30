-- Inserir entregas de teste para as primeiras 3 semanas da aluna Fabiana
INSERT INTO user_mission_completions (user_id, mission_id, proof_content, proof_links, status, submitted_at)
VALUES 
  -- Semana 1: Missão Identidade Soberana (pendente de aprovação)
  (
    '450eef02-2e5c-4e63-b116-9d9b1a85b483',
    '022eeead-db59-4664-aba3-cba4cb6cf742',
    'Criei minha identidade visual como advogada especializada em Direito de Família. Defini meu posicionamento como "A advogada que protege famílias em transição". Atualizei meu perfil do Instagram com foto profissional e bio clara.',
    ARRAY['https://instagram.com/exemplo_bio', 'https://canva.com/meu-kit-visual'],
    'submitted',
    NOW() - INTERVAL '1 day'
  ),
  -- Semana 2: Missão Radar de Desejos (pendente de aprovação)
  (
    '450eef02-2e5c-4e63-b116-9d9b1a85b483',
    '119c569b-58fd-4d47-884a-0a7ed92beca3',
    'Fiz 5 entrevistas com potenciais clientes para entender suas dores. Principais descobertas: 1) Medo do processo de divórcio, 2) Preocupação com a guarda dos filhos, 3) Desejo de resolver rapidamente. Criei um documento com as personas.',
    ARRAY['https://docs.google.com/document/exemplo-pesquisa'],
    'submitted',
    NOW() - INTERVAL '6 hours'
  ),
  -- Semana 3: Missão Motor de Vendas (pendente)
  (
    '450eef02-2e5c-4e63-b116-9d9b1a85b483',
    '5c619ebe-5d76-4877-9a6e-1b924c53b742',
    'Configurei meu funil de vendas no Instagram: Bio otimizada -> Story com CTA -> Link na bio para WhatsApp. Criei 3 posts educativos sobre divórcio e guarda. Recebi 2 mensagens de interessados!',
    ARRAY['https://instagram.com/p/exemplo-post1', 'https://instagram.com/p/exemplo-post2'],
    'submitted',
    NOW()
  );
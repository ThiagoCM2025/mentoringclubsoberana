
# Plano: Restaurar Curso Mentoria 360°

## Problema Identificado
O curso com `program_type: mentoria-360` foi editado incorretamente:
- **Título atual**: "Soberana Elite Mastermind Anual" 
- **Imagem atual**: `/assets/program-elite-BJgBXjqz.jpg` (imagem do programa Elite)

## Restauração Necessária
Atualizar o banco de dados para restaurar os valores originais:

| Campo | Valor Atual (errado) | Valor Correto |
|-------|---------------------|---------------|
| Título | Soberana Elite Mastermind Anual | Mentoria Soberana 360° |
| Imagem | /assets/program-elite-BJgBXjqz.jpg | /assets/programs/program-mentoria-360.jpg |

## Ação Técnica
Executar UPDATE no banco de dados:

```sql
UPDATE courses 
SET 
  title = 'Mentoria Soberana 360°',
  thumbnail_url = '/assets/programs/program-mentoria-360.jpg',
  updated_at = NOW()
WHERE id = 'c0000001-0004-0000-0000-000000000004';
```

## Resultado Esperado
- O card do curso na área "Meus Cursos" exibirá:
  - **Título**: "Mentoria Soberana 360°"
  - **Imagem**: A foto correta da mentora (não mais o placeholder cinza)

## Arquivo Afetado
Nenhum arquivo de código será modificado - apenas atualização de dados no banco.

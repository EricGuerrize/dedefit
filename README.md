# DedeFit - Workout Tracker

Um aplicativo web moderno para rastreamento de treinos (Musculação e Corrida) construído com React 18, TypeScript, Tailwind CSS e Supabase.

## Requisitos

- Node.js (v18+)
- Conta no [Supabase](https://supabase.com/)

## Configuração do Banco de Dados (Supabase)

1. Crie um novo projeto no Supabase.
2. Vá até a seção "SQL Editor" e execute as queries presentes no arquivo `schema.sql`.

## Configuração Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. O arquivo `.env.local` já foi gerado na raiz do projeto. Preencha com as suas credenciais do Supabase (URL e Anon Key).
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades
- **PWA Instalável:** Suporte offline básico e instalação mobile.
- **Autenticação:** Login e Cadastro seguros via Supabase Auth.
- **Dashboard:** Resumos de volume, treinos na semana e gráficos de progresso (Recharts).
- **Log de Treinos:** Formulários adaptados para Musculação (séries, repetições, peso) e Corrida (distância, tempo, cálculo de pace).
- **Histórico:** Filtros e listagem completa dos treinos com opção de deleção.
- **Planos Pré-montados:** Clonagem de modelos de treino direto para sua conta.

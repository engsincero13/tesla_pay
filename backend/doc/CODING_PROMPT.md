
# Code Agent Prompt: Tesla Pay Setup

"Atue como um Engenheiro Full-Stack Senior. Configure um novo repositório Next.js 14+ com TypeScript, Prisma e Tailwind CSS. 

A aplicação chama-se 'Tesla Pay' e é um sistema de contas a pagar unificado para PF e PJ.

**Diretrizes Iniciais:**
1. Configure o Prisma com as entidades: Workspace (PF, PJ), Supplier, AccountPayable, PaymentLog e Category.
2. Crie uma UI baseada em Tailwind que siga o estilo 'Apple-like' (muito branco, cinza claro, sombras suaves, cantos arredondados de 24px-32px, fonte Inter).
3. Implemente um 'Global Workspace Toggle' no topo do layout principal que filtre todos os dados da aplicação entre PF, PJ ou AMBOS.
4. Crie um formulário de 'Lançamento Rápido' em um modal que suporte: Seleção de fornecedor com autocomplete, valor, vencimento, categoria e método de pagamento (com destaque para Pix).
5. O dashboard deve conter 4 cards de KPI (Hoje, 7 Dias, Atrasado, Pendentes) e uma tabela de contas com filtros por status e busca por texto.
6. Use Lucide-react para ícones e Recharts para um gráfico de linha simples de evolução de despesas.

Garanta que o código seja modular, com separação clara entre serviços (lógica de negócio) e componentes (UI)."

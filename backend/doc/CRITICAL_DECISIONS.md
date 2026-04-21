
# Decisões Críticas e Premissas

1. **Gestão de Anexos:** No MVP, os anexos serão armazenados em Base64 ou via um provider simples (S3/Uploadcare). Decidimos não focar em OCR automático agora para garantir a entrega do core financeiro primeiro.
2. **Recorrência:** Contas recorrentes gerarão um novo registro automaticamente todo mês 5 dias antes do fechamento do mês anterior, mantendo o histórico de cada ocorrência individualmente.
3. **Automação Bancária:** O sistema é **manual** por design inicial para garantir o controle total de Maurício (Single Source of Truth). Integrações via OFX/API Bancária ficam para a Fase 2.
4. **Moeda:** Suporte exclusivo para BRL (Real) com formatação brasileira de datas e números.
5. **Responsividade:** Foco em Desktop para o dashboard analítico e Mobile para o lançamento rápido e consulta de dados Pix durante o pagamento.

# Apex Trader Funding - Detalhes Avaliação EOD

## Parâmetros de Conta (EOD Evaluation)

| Tamanho | Meta de Lucro | Drawdown Máx (EOD) | Limite Diário (DLL) | Contratos Máx |
| :--- | :--- | :--- | :--- | :--- |
| **25K** | $1,500 | $1,000 | $500 | 4 |
| **50K** | $3,000 | $2,000 | $1,000 | 6 |
| **100K** | $6,000 | $3,000 | $1,500 | 8 |
| **150K** | $9,000 | $4,000 | $2,000 | 12 |

**Período de Acesso:** 30 dias.
**Consistência e Escalonamento:** Não aplicados na fase de avaliação.

## Conta Performance (PA) EOD - O que muda?

A conta PA é liberada após a aprovação no exame. Ela mantém o modelo EOD, mas possui limites de contratos **menores** e regras mais rígidas.

### Parâmetros da Conta Performance (PA) EOD

| Tamanho | Max Drawdown (EOD) | Contratos Máx (PA) | Scaling Tiers | DLL Tier Based |
| :--- | :--- | :--- | :--- | :--- |
| **25K** | $1,000 | **2** | Sim | Sim |
| **50K** | $2,000 | **4** | Sim | Sim |
| **100K** | $3,000 | **6** | Sim | Sim |
| **150K** | $4,000 | **10** | Sim | Sim |

### Regras Exclusivas da Conta PA
1.  **Scaling Tier Based (Escalonamento):** O número de contratos permitidos aumenta conforme o saldo da conta cresce. Você não começa com o limite máximo total da avaliação.
2.  **DLL Tier Based:** O Limite de Perda Diária também é ajustado conforme o seu nível (Tier).
3.  **Inactivity Rule (Inatividade):** Existe uma regra de inatividade. A conta deve ser operada regularmente para permanecer ativa.
4.  **100% Payout Split:** O trader mantém 100% dos ganhos aprovados (dentro das regras de elegibilidade).

## Funcionamento Detalhado do EOD Threshold

*   **Cálculo:** Recalculado diariamente às 16:59 ET (fechamento). Baseado no maior saldo de fechamento atingido.
*   **Aplicação:** O valor é fixado para a próxima sessão, mas a **aplicação é em TEMPO REAL**. Se tocar no valor durante o dia, a conta cai.
*   **Threshold Nunca Desce:** Ele apenas segue o lucro para cima ou fica parado.

### Quando o Drawdown Para de Subir (Stop Level)?

Esta é a regra mais importante para proteger o lucro a longo prazo:

1.  **Contas Performance (PA):** O drawdown para de subir quando atinge o **Saldo Inicial + $100**. 
    *   *Ex: Numa conta de 50k, o drawdown trava em $50,100 quando o seu saldo de fechamento bater $52,100.*
2.  **Avaliações (Rithmic/Wealthcharts):** O drawdown para de subir quando atinge o valor da **Meta de Lucro (Target Profit)**.
    *   *Ex: Numa conta de 50k, o drawdown trava em $53,000 quando o saldo fechar acima de $55,000.*
3.  **Avaliações (Tradovate):** O drawdown **segue o lucro indefinidamente** (trails indefinitely). Não existe ponto de parada.

## Perguntas Frequentes (FAQ) - Apex EOD

1.  **Posso passar em um dia?** Sim, assim que bater a meta de lucro, sem limite mínimo de dias.
2.  **Existe limite de tempo?** Sim, você tem **30 dias corridos** desde a compra para bater a meta.
3.  **Bater o DLL reprova a conta?** NÃO. Bater o Limite de Perda Diária (DLL) apenas pausa o trading na sessão atual. A conta continua ativa para o próximo dia.
4.  **Bater o Threshold (EOD) reprova a conta?** SIM. Tocar no drawdown EOD em qualquer momento resulta em falha imediata.
5.  **Quando reseta o dia?** O dia de negociação reseta às **18:00 (6:00 PM) ET**.
6.  **DLL afeta o Threshold?** Não, são regras separadas.
7.  **A regra dos 30 dias vale para a PA?** Não, o limite de 30 dias é apenas para a fase de Avaliação.
8.  **Quantas PAs posso ter?** Você pode ter até **20 contas PA** ativas simultaneamente (independente do tamanho ou tipo).
9.  **A conta PA é uma conta real?** Não, é uma conta de **Simulação Financiada (Sim-Funded)**.
10. **Bater o DLL na PA fecha a conta?** NÃO. Assim como na avaliação, bater o DLL apenas pausa as operações no dia e reseta na próxima sessão.
11. **O tamanho da posição pode aumentar?** Sim, conforme você sobe nos **Scaling Levels** baseados no seu saldo de fechamento.
12. **O Profit Split é de 100%?** Sim, você recebe 100% dos saques aprovados após cumprir os requisitos.

---

## Proibições Cruciais (Avaliação e PA)
*   **Hedge:** Proibido fazer hedge entre contas.
*   **Liquidação Automática:** Se tocar no Threshold intraday, a liquidação é instantânea e a conta é perdida (PA fechada ou Avalição reprovada).
*   **Atividade Proibida:** Qualquer tentativa de burlar as regras resulta em fechamento imediato.

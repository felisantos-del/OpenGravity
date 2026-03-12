/**
 * Ferramenta que retorna a data e hora atual formatada.
 */
export function getTime() {
    const agora = new Date();
    return agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Descrição da ferramenta para a IA entender quando usar
export const getTimeDefinition = {
    type: "function" as const,
    function: {
        name: "get_time",
        description: "Retorna a data e hora atual de Brasília/São Paulo.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
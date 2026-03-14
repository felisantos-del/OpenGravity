import fs from 'fs';
import path from 'path';

/**
 * Ferramenta que busca informações específicas no Knowledge Base (FAQ) local da Lucid Trading.
 */
export function readLucidFaq(query?: string) {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'lucid_faq.md');
        if (!fs.existsSync(filePath)) {
            return "Erro: O FAQ local não foi encontrado. O script de scraping precisa ser rodado primeiro.";
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const articles = content.split('---').map(a => a.trim()).filter(a => a.length > 0);

        if (!query) {
            // Se não tem query, retorna apenas o índice (títulos) para economizar tokens
            const titles = articles.map(a => {
                const match = a.match(/^##\s+(.+)$/m);
                return match ? match[1] : '';
            }).filter(t => t.length > 0);
            
            return `O FAQ contém os seguintes artigos. Use a tool novamente passando um "query" específico para ler os detalhes:\n- ` + titles.join('\n- ');
        }

        // Busca simples por palavras chave
        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
        
        // Calcular pontuação para cada artigo
        const scoredArticles = articles.map(article => {
            const articleLower = article.toLowerCase();
            let score = 0;
            for (const kw of keywords) {
                if (articleLower.includes(kw)) score += 1;
            }
            return { article, score };
        }).filter(a => a.score > 0);

        // Ordenar por relevância
        scoredArticles.sort((a, b) => b.score - a.score);

        // Pegar apenas os 2 mais relevantes (reduzido de 3 para poupar tokens)
        const topArticles = scoredArticles.slice(0, 2).map(a => a.article);

        if (topArticles.length === 0) {
            return `Nenhum artigo encontrado no FAQ para a busca: "${query}". Tente simplificar as palavras-chave.`;
        }

        let result = `Resultados da busca por "${query}" no FAQ da Lucid:\n\n` + topArticles.join('\n\n---\n\n');
        
        // Limita o tamanho máximo de caracteres da resposta para não estourar os tokens (max ~5000 chars)
        if (result.length > 5000) {
            result = result.substring(0, 5000) + '... [Cortado por limite de tokens]';
        }
        
        console.log(`[Tools] readLucidFaq encontrou ${topArticles.length} artigos para "${query}". Retornando ${result.length} caracteres.`);
        return result;

    } catch (error: any) {
        return `Erro ao ler a base de conhecimento local: ${error.message}`;
    }
}

export const readLucidFaqDefinition = {
    type: "function" as const,
    function: {
        name: "read_lucid_faq",
        description: "Busca informações na base de conhecimento (FAQ) da Lucid Trading. Você deve passar palavras-chave no parâmetro 'query' para encontrar as regras corretas.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Palavras-chave para buscar no FAQ. Ex: 'LucidPro rules', 'drawdown', 'payout days'."
                }
            },
            required: ["query"],
        },
    },
};

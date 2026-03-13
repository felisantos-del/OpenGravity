import fs from 'fs';
import path from 'path';

/**
 * Ferramenta que consulta a Base de Conhecimento Profissional local.
 */
export function searchKnowledge(query: string) {
    try {
        const kbPath = path.join(process.cwd(), 'src', 'knowledge');
        if (!fs.existsSync(kbPath)) {
            return "Erro: Base de conhecimento não encontrada no servidor.";
        }

        const files = fs.readdirSync(kbPath).filter(f => f.endsWith('.md'));
        let allResults: string[] = [];

        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);

        for (const file of files) {
            const content = fs.readFileSync(path.join(kbPath, file), 'utf-8');
            const sections = content.split(/^##\s+/m).map(s => s.trim());
            
            for (const section of sections) {
                const sectionLower = section.toLowerCase();
                let match = false;
                
                // Se encontrar qualquer link de palavra chave, considera match
                for (const kw of keywords) {
                    if (sectionLower.includes(kw)) {
                        match = true;
                        break;
                    }
                }

                if (match) {
                    allResults.push(`[Fonte: ${file}]\n${section}`);
                }
            }
        }

        if (allResults.length === 0) {
            return `Não encontrei informações específicas sobre "${query}" nos manuais internos. Tente pesquisar por termos mais simples como 'drawdown', 'saque' ou 'regras'.`;
        }

        // Retorna no máximo as 2 melhores seções para poupar token (muito importante para evitar erro 429)
        return allResults.slice(0, 2).join('\n\n--- NEXT SECTION ---\n\n');

    } catch (error: any) {
        return `Erro ao acessar o conhecimento: ${error.message}`;
    }
}

export const searchKnowledgeDefinition = {
    type: "function" as const,
    function: {
        name: "search_knowledge_base",
        description: "Busca informações exatas e profissionais sobre regras da mesa, drawdown e pagamentos nos manuais internos. USE ESTA FERRAMENTA ANTES DE QUALQUER PESQUISA NA WEB.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Termo de busca (ex: drawdown, regras de saque, profit split)"
                }
            },
            required: ["query"],
        },
    },
};

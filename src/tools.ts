import { getTime, getTimeDefinition } from './tools/getTime.js';
import { fetchWebsite, fetchWebsiteDefinition } from './tools/fetchWebsite.js';
import { readLucidFaq, readLucidFaqDefinition } from './tools/readLucidFaq.js';
import { searchKnowledge, searchKnowledgeDefinition } from './tools/searchKnowledge.js';

export const availableTools = [
  getTimeDefinition,
  readLucidFaqDefinition,
  {
    ...fetchWebsiteDefinition,
    function: {
      ...fetchWebsiteDefinition.function,
      description: "Acessa uma URL externa. USE APENAS SE A INFORMAÇÃO NÃO ESTIVER NO CONHECIMENTO INTERNO."
    }
  },
  searchKnowledgeDefinition
];

export async function executeToolCall(toolCall: any) {
  const functionName = toolCall.function.name;
  let args = {};
  
  if (toolCall.function.arguments) {
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Erro ao fazer parse dos argumentos da tool:", functionName);
    }
  }

  switch (functionName) {
    case 'get_time':
      // Usando a nova função que considera o fuso horário correto do Brasil
      return getTime();
    case 'get_current_time':
      // Fallback caso o LLM tente usar o nome antigo
      return getTime();
    case 'fetch_website':
      return await fetchWebsite((args as {url: string}).url);
    case 'read_lucid_faq':
      return readLucidFaq((args as {query?: string}).query);
    case 'search_knowledge_base':
      return searchKnowledge((args as {query: string}).query);
    default:
      console.warn(`Tool desconhecida: ${functionName}`);
      return `Erro: Tool ${functionName} não encontrada.`;
  }
}

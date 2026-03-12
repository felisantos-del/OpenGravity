import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Ferramenta que acessa um site e retorna o texto útil dele.
 * Usado para buscar informações atualizadas de qualquer URL, incluindo a prop firm Lucid (lucidtrading.com)
 */
export async function fetchWebsite(url: string) {
    let browser;
    try {
        console.log(`[Tools] Iniciando Puppeteer para raspar: ${url}`);
        
        // Lança o Puppeteer no modo headless
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Simula um User-Agent real para evitar bloqueios extras
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Vai até a URL e espera que a rede fique ociosa (ajuda com sites React/Vue e Cloudflare)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Pega todo o HTML já renderizado (pós-JavaScript/Cloudflare)
        const html = await page.content();
        
        const $ = cheerio.load(html);
        
        // Remove scripts, estilos e navs inúteis para economizar tokens
        $('script, style, noscript, asides, nav, footer, iframe, img, svg').remove();
        
        // Pega apenas o texto estruturado e limpa espaços extras
        let text = $('body').text();
        text = text.replace(/\s+/g, ' ').trim();
        
        // Limita o tamanho para não estourar o contexto do LLM (aprox 4000 caracteres)
        if (text.length > 5000) {
            text = text.substring(0, 5000) + '... [Conteúdo truncado por limite de tamanho]';
        }
        
        return `Conteúdo do site ${url}:\n\n${text}`;
    } catch (error: any) {
        return `Erro de conexão ou falha ao raspar a URL ${url}: ${error.message}`;
    }
}

export const fetchWebsiteDefinition = {
    type: "function" as const,
    function: {
        name: "fetch_website",
        description: "Acessa uma URL (como https://lucidtrading.com/) e extrai todo o texto da página para obter informações em tempo real e regras sobre a empresa.",
        parameters: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "A URL completa do site para acessar. Exemplo: https://lucidtrading.com/"
                }
            },
            required: ["url"],
        },
    },
};

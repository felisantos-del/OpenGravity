import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://support.lucidtrading.com';
const START_URL = 'https://support.lucidtrading.com/en/';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("Iniciando scraper do FAQ da Lucid...");
  const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log(`Acessando a home: ${START_URL}`);
    await page.goto(START_URL, { waitUntil: 'networkidle2' });
    let html = await page.content();
    let $ = cheerio.load(html);

    // Pegar todos os links de coleções
    const collectionLinks: string[] = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/collections/')) {
        collectionLinks.push(href.startsWith('http') ? href : BASE_URL + href);
      }
    });
    const uniqueCollections = [...new Set(collectionLinks)];
    console.log(`Encontradas ${uniqueCollections.length} coleções.`);

    const articleLinks: string[] = [];

    for (const url of uniqueCollections) {
      console.log(`Acessando coleção: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      await delay(1000);
      html = await page.content();
      $ = cheerio.load(html);

      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/articles/')) {
          articleLinks.push(href.startsWith('http') ? href : BASE_URL + href);
        }
      });
    }

    const uniqueArticles = [...new Set(articleLinks)];
    console.log(`Encontrados ${uniqueArticles.length} artigos no total.`);

    let markdownOutput = `# Lucid Trading FAQ Knowledge Base\n\n`;

    // Processar cada artigo
    for (let i = 0; i < uniqueArticles.length; i++) {
        const url = uniqueArticles[i];
        console.log(`[${i+1}/${uniqueArticles.length}] Lendo artigo: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        await delay(1000);
        html = await page.content();
        $ = cheerio.load(html);

        const title = $('h1').first().text().trim();
        
        // General text extraction strategy
        $('script, style, nav, footer, asides').remove();
        
        // O corpo do artigo do Intercom costuma estar na tag article
        let content = $('article').text();
        if (!content) {
            content = $('body').text();
        }
        
        content = content.replace(/\s+/g, ' ').trim();
        
        markdownOutput += `## ${title}\nURL: ${url}\n\n${content}\n\n---\n\n`;
    }

    const outDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const outFile = path.join(outDir, 'lucid_faq.md');
    fs.writeFileSync(outFile, markdownOutput);
    console.log(`FAQ salvo com sucesso com ${markdownOutput.length} caracteres em ${outFile}`);

  } catch (error) {
    console.error("Erro no scraping:", error);
  } finally {
    await browser.close();
  }
}

run();

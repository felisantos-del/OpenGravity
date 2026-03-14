import { Bot, InputFile } from 'grammy';
import { Groq } from 'groq-sdk';
import { config } from './config.js';
import db from './database.js';
import { availableTools, executeToolCall } from './tools.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import http from 'http';

let bot: Bot;
let groq: Groq;

try {
  console.log("[Bot] Carregando configurações...");
  bot = new Bot(config.telegramToken);
  groq = new Groq({ apiKey: config.groqKey });

  // Limpa webhook ao iniciar para garantir que o polling funcione (evita conflito local/nuvem)
  bot.api.deleteWebhook({ drop_pending_updates: true }).then(() => {
    console.log("[Bot] Webhook deletado/limpo com sucesso.");
  }).catch(e => console.error("[Bot] Erro ao deletar webhook:", e));

} catch (e: any) {
  console.error("❌ ERRO CRÍTICO NA INICIALIZAÇÃO:");
  console.error(e.message || e);
  process.exit(1);
}

// Servidor HTTP simples para Health Check (Necessário para Railway/Render)
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OpenGravity Bot is running!');
}).listen(PORT, () => {
  console.log(`[HealthCheck] Servidor rodando na porta ${PORT}`);
});

// Whitelist de segurança e verificação de Admin
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // 1. Check explicit whitelist
  if (config.allowedIds.includes(userId)) {
    return await next();
  }

  // 2. Check if user is an admin in the current chat (if it's a group/supergroup)
  if (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') {
    try {
      const chatMember = await ctx.getChatMember(userId);
      if (['administrator', 'creator'].includes(chatMember.status)) {
        console.log(`[Whitelist] Permitindo acesso para Admin: ${ctx.from?.first_name} (ID: ${userId})`);
        return await next();
      }
    } catch (e) {
      console.error("[Whitelist] Erro ao verificar status de admin:", e);
    }
  }

  // 3. Acesso negado
  const userName = ctx.from?.first_name || 'Usuário desconhecido';
  const chatInfo = ctx.chat?.id ? `no chat ${ctx.chat.id}` : 'em private';
  console.log(`[Whitelist] Acesso NEGADO para: ${userName} (ID: ${userId}) ${chatInfo}`);
  await ctx.reply(`Acesso negado. Seu ID: ${userId}. Se você for administrador, tente enviar uma mensagem no grupo.`);
});

bot.command("start", (ctx) => ctx.reply("🚀 OpenGravity Online! Agora o cérebro está conectado. Mande um oi!"));

// Função Cérebro (Reutilizável para Texto e Áudio)
async function handleAgentLoop(ctx: any, userMessage: string, isAudio: boolean = false) {
  const userId = ctx.from.id;
  const sessionId = ctx.message.message_thread_id ? `${userId}_${ctx.message.message_thread_id}` : `${userId}`;
  const isForum = !!ctx.message.message_thread_id;

  // Salva na memória do Firebase
  try {
    await db.collection('messages').add({
      userId: userId,
      threadId: ctx.message.message_thread_id || null,
      sessionId: sessionId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("Erro ao gravar no Firebase:", e);
  }

  try {
    if (!isAudio) await ctx.replyWithChatAction("typing");

    let messages: any[] = [];
    
    // Busca as últimas 8 mensagens do contexto atual
    try {
      const historySnapshot = await db.collection('messages')
        .where('sessionId', '==', sessionId)
        .orderBy('timestamp', 'desc')
        .limit(4) // Reduzido de 8 para 4 para evitar erro 429 de tokens
        .get();
        
      const history = historySnapshot.docs.map(doc => doc.data()).reverse();
      history.forEach((msg: any) => messages.push({ role: msg.role, content: msg.content }));
    } catch(e) {
      console.error("Erro ao buscar histórico no Firebase:", e);
      messages.push({ role: 'user', content: userMessage }); // fallback
    }

    let forumContextInfo = '';
    if (isForum) {
      const threadId = ctx.message.message_thread_id;
      if (threadId === config.topics.lucid) {
        forumContextInfo = `\n[FOCO: LUCID TRADING] Você está no tópico oficial da Lucid. FALE APENAS DA LUCID. Se perguntarem da Apex, diga que devem ir para o tópico dela.`;
      } else if (threadId === config.topics.apex) {
        forumContextInfo = `\n[FOCO: APEX TRADER FUNDING] Você está no tópico oficial da Apex. FALE APENAS DA APEX. Se perguntarem da Lucid, diga que devem ir para o tópico dela.`;
      } else {
        forumContextInfo = `\n[TOPIC_ID: ${threadId}] Tente identificar a mesa pelo assunto ou responda de forma geral.`;
      }
    }

    // prompt de sistema super simplificado e autoritário
    messages.unshift({ 
      role: 'system', 
      content: `VOCÊ É O OPENGRAVITY. ESPECIALISTA EM MESA PROPRIETÁRIA. ${forumContextInfo}
      ORDENS TÉCNICAS:
      1. PRIORIDADE TOTAL: Se a informação estiver nos manuais internos (ferramenta 'search_knowledge_base'), USE-OS.
      2. WEB SEARCH: Use 'fetch_website' APENAS se o assunto NÃO existir nos manuais internos ou FAQ.
      3. NUNCA escreva JSON no chat.
      4. Responda de forma direta e profissional.`
    });

    let finalContent = "";
    
    // Loop do Agente para executar tools (aumentado para 6 iterações para ferramentas que exigem múltiplas buscas)
    for (let i = 0; i < 6; i++) {
      try {
        const completion = await groq.chat.completions.create({
          messages,
          model: config.model,
          tools: availableTools,
          tool_choice: "auto",
        });

        const responseMessage = completion.choices[0]?.message;
        if (!responseMessage) break;

        messages.push(responseMessage);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          for (const toolCall of responseMessage.tool_calls) {
            if (toolCall.type !== 'function') continue;
            
            console.log(`[Agent] Executando tool: ${toolCall.function.name}`);
            const toolResult = await executeToolCall(toolCall);
            
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
            });
          }
        } else {
          finalContent = responseMessage.content || "Sem resposta da IA.";
          break;
        }
      } catch (err: any) {
        if (err.status === 400 && err.error?.error?.code === 'tool_use_failed') {
          console.warn("[Agent] LLM formatou a tool incorretamente. Injetando erro no histórico para tentar novamente.");
          messages.push({
            role: 'user',
            content: "Ocorreu um erro ao tentar chamar a ferramenta. Por favor, NÃO use formatação de tags HTML/XML como <function>. Apenas retorne o JSON esperado pela API nativa ou responda diretamente usando seu conhecimento em texto puro."
          });
          continue;
        } else {
          throw err;
        }
      }
    }

    const botReply = finalContent || "Sem resposta da IA após rodar tools.";

    // Salva resposta na memória do Firebase
    try {
      await db.collection('messages').add({
        userId: userId,
        threadId: ctx.message.message_thread_id || null,
        sessionId: sessionId,
        role: 'assistant',
        content: botReply,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Erro ao gravar resposta no Firebase:", e);
    }

    if (isAudio && config.elevenLabsKey) {
      // Se o usuário mandou áudio, vamos responder em áudio usando ElevenLabs
      try {
        await ctx.replyWithChatAction("record_voice");

        // Rachel: 21m00Tz4mWgumN5GUYFv
        // Alice: Xb7hH8MSUJpSbSDYk0k2
        // Gigi: jBpfuIE2acCO8z3wKNLl
        const voiceId = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice 
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'xi-api-key': config.elevenLabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: botReply,
            model_id: "eleven_multilingual_v2", 
            voice_settings: {
              similarity_boost: 0.8,
              stability: 0.5
            }
          })
        });

        if (!ttsResponse.ok) {
          const errorData = await ttsResponse.json();
          console.error("ElevenLabs Detailed Error:", errorData);
          throw new Error(`ElevenLabs Error: ${ttsResponse.statusText}`);
        }

        const arrayBuffer = await ttsResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Telegram aceita arquivos via Buffer usando GrammY's InputFile
        await ctx.replyWithVoice(new InputFile(buffer, 'voice.mp3'));

      } catch (audioError: any) {
        console.error("Erro no TTS da ElevenLabs:", audioError);
        // Fallback pra texto caso o áudio falhe
        await ctx.reply(botReply);
      }
    } else {
      await ctx.reply(botReply);
    }

  } catch (error: any) {
    console.error("--- ERRO NA IA ---");
    console.error(error.message || error);
    console.error("------------------");

    // Salva o erro no Firebase para diagnóstico posterior
    try {
      await db.collection('errors').add({
        userId: userId,
        sessionId: sessionId,
        errorMessage: error.message || "Erro desconhecido",
        errorStack: error.stack || null,
        userMessage: userMessage,
        timestamp: Date.now()
      });
    } catch (dbErr) {
      console.error("Erro ao gravar log de erro no Firebase:", dbErr);
    }

    await ctx.reply("❌ Erro na IA. Dá uma olhada no terminal do VS Code ou no console do Firebase para ver o motivo real.");
  }
}

bot.on("message:text", async (ctx) => {
  console.log(`[Bot] Mensagem recebida de ${ctx.from.id}: ${ctx.message.text}`);
  await handleAgentLoop(ctx, ctx.message.text, false);
});

// Handler para Áudios (Voz)
bot.on("message:voice", async (ctx) => {
  try {
    await ctx.replyWithChatAction("record_voice");
    
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${config.telegramToken}/${file.file_path}`;
    
    // Baixa o áudio .ogg
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Falha ao baixar áudio do Telegram");
    
    // Node-fetch lida com buffers em NodeJS
    const buffer = await response.buffer();
    
    const formData = new FormData();
    formData.append('file', buffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
    formData.append('model', 'whisper-large-v3');
    
    // API Call pro Whisper
    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqKey}`
      },
      body: formData
    });
    
    const data: any = await groqResponse.json();
    if (!data.text) {
        console.error("Whisper Error Payload:", data);
        throw new Error("Falha na transcrição do áudio (sem texto).");
    }
    
    const transcriptText = data.text;
    await ctx.reply(`🎙️ _Entendi: "${transcriptText}"_ \n\nPensando...`, { parse_mode: 'Markdown' });
    
    // Repassa o texto traduzido pro cérebro
    await handleAgentLoop(ctx, transcriptText, true);
    
  } catch (error: any) {
    console.error("Erro no Áudio:", error);
    await ctx.reply("❌ Não consegui ouvir ou transcrever seu áudio. O Whisper falhou.");
  }
});

console.log("-----------------------------------------");
console.log("🚀 OpenGravity iniciando em modo local...");
console.log("✅ Aguardando mensagens no Telegram...");
console.log("-----------------------------------------");

bot.start();
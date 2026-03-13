import admin from 'firebase-admin';
import path from 'path';

// Inicializa o app Firebase Admin
let credential: any;

// Tenta primeiro as variáveis individuais (mais robusto no Render/Cloud)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        });
        console.log("[Firebase] Usando credenciais via variáveis individuais (PROXIED).");
    } catch (err) {
        console.error("[Firebase] Erro ao carregar variáveis individuais:", err);
    }
} 
// Fallback para o JSON completo se as individuais não existirem
else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        let rawData = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            rawData = rawData.slice(1, -1);
        }
        const serviceAccount = JSON.parse(rawData);
        credential = admin.credential.cert(serviceAccount);
        console.log("[Firebase] Usando credenciais da variável JSON.");
    } catch (err) {
        console.error("[Firebase] Erro ao processar JSON do Firebase:", err);
    }
}

if (!credential) {
    try {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
        credential = admin.credential.cert(serviceAccountPath);
        console.log("[Firebase] Usando arquivo local firebase-key.json");
    } catch (err) {
        console.error("❌ [Firebase] ERRO CRÍTICO: Nenhuma credencial encontrada (env ou arquivo).");
        process.exit(1); // Fecha o processo com erro claro
    }
}

try {
    admin.initializeApp({
        credential: credential,
    });
    console.log("[Firebase] ✅ Inicializado com sucesso!");
} catch (e) {
    console.error("[Firebase] ❌ Erro na função initializeApp:", e);
    process.exit(1);
}

const db = admin.firestore();

export default db;
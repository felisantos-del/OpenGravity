import admin from 'firebase-admin';
import path from 'path';

// Inicializa o app Firebase Admin
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(serviceAccount);
        console.log("[Firebase] Usando credenciais da variável de ambiente.");
    } catch (err) {
        console.error("[Firebase] Erro ao fazer parse da FIREBASE_SERVICE_ACCOUNT:", err);
    }
}

if (!credential) {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
    credential = admin.credential.cert(serviceAccountPath);
    console.log("[Firebase] Usando credenciais do arquivo local firebase-key.json");
}

try {
    admin.initializeApp({
        credential: credential,
    });
    console.log("[Firebase] Conectado com sucesso ao Firestore!");
} catch (e) {
    console.error("[Firebase] Erro ao inicializar:", e);
}

const db = admin.firestore();

export default db;
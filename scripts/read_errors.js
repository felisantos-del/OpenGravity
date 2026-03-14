import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = 'c:/Users/Felipe/Documents/OpenGravity/firebase-key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

const db = admin.firestore();

async function readErrors() {
  const snapshot = await db.collection('errors').orderBy('timestamp', 'desc').limit(5).get();
  if (snapshot.empty) {
    console.log('Nenhum erro encontrado.');
    return;
  }
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

readErrors().catch(console.error);

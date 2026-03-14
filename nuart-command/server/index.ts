import express from 'express';
import cors from 'cors';
import db, { initDB } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Inicializa o banco
initDB();

// === ROTAS DE TESTE / SAÚDE ===
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nuart Command Backend Online' });
});

// === ROTAS DE PATRIMÔNIO ===
app.get('/api/assets', (req, res) => {
  const assets = db.prepare('SELECT * FROM assets ORDER BY updated_at DESC').all();
  res.json(assets);
});

app.post('/api/assets', (req, res) => {
  const { tag, description, location, status } = req.body;
  try {
    const id = `A-${Date.now()}`;
    const stmt = db.prepare('INSERT INTO assets (id, tag, description, location, status) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, tag, description, location, status);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/movements', (req, res) => {
  const { asset_id, type, technician, user, location, notes } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO history (asset_id, type, technician, user, location, notes) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(asset_id, type, technician, user, location, notes);
    
    // Atualiza a localização no ativo principal
    db.prepare('UPDATE assets SET location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(location, asset_id);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 SERVIDOR NUART LOCAL ONLINE`);
  console.log(`📍 ACESSO: http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
});

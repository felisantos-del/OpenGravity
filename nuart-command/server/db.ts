import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

/**
 * Inicializa a estrutura do banco de dados profissional offline
 */
export function initDB() {
  db.exec(`
    -- Tabela de Patrimônio (Ativos)
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      tag TEXT UNIQUE,
      description TEXT,
      location TEXT,
      status TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Histórico de Movimentações
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT,
      type TEXT, -- 'ENTRADA' ou 'SAÍDA'
      origin TEXT, -- 'Unidade' ou 'Estadual'
      technician TEXT,
      user TEXT,
      location TEXT,
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Colaboradores e Acesso (RBAC)
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT, -- 'Admin', 'Tecnico', 'Leitura'
      department TEXT,
      status TEXT DEFAULT 'Ativo'
    );
  `);
  
  console.log("[DB] Banco de Dados SQLite inicializado com sucesso.");
}

export default db;

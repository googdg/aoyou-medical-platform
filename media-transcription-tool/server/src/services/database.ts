import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import { logger } from '../utils/logger'

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

export async function initializeDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  try {
    if (db) {
      return db
    }

    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'transcription.db')
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')

    // Create tables
    await createTables()

    logger.info('Database initialized successfully', { dbPath })
    return db
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}

async function createTables() {
  if (!db) throw new Error('Database not initialized')

  // Jobs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'file' or 'url'
      source TEXT NOT NULL, -- file path or URL
      original_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
      progress INTEGER DEFAULT 0,
      options TEXT, -- JSON string of transcription options
      result TEXT, -- JSON string of transcription result
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `)

  // Files table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      duration REAL, -- in seconds
      metadata TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Transcriptions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transcriptions (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      text TEXT NOT NULL,
      language TEXT,
      confidence REAL,
      segments TEXT, -- JSON string of segments with timestamps
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
    )
  `)

  // Exports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS exports (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      format TEXT NOT NULL, -- 'txt', 'srt', 'vtt', 'docx', 'pdf'
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
    )
  `)

  logger.info('Database tables created successfully')
}

export function getDatabase(): Database<sqlite3.Database, sqlite3.Statement> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
    logger.info('Database connection closed')
  }
}
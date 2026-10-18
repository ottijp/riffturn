import { app } from 'electron'
import Database from 'better-sqlite3'
import applicationIdentity from '#app-identity'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const databaseSchemaVersion = 3

export type ApplicationDatabase = Database.Database

function databasePath(): string {
  return path.join(app.getPath('appData'), applicationIdentity.appId, 'riffturn.sqlite3')
}

export function applicationDataPath(): string {
  return path.dirname(databasePath())
}

export async function openDatabase(): Promise<ApplicationDatabase> {
  await fs.mkdir(applicationDataPath(), { recursive: true })
  const database = new Database(databasePath())
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY NOT NULL,
      file_hash TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS projects_file_hash ON projects(file_hash);
    CREATE TABLE IF NOT EXISTS waveforms (
      file_hash TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `)
  const userVersion = database.pragma('user_version', { simple: true }) as number
  if (userVersion < databaseSchemaVersion) {
    database.transaction(() => {
      database.prepare('DELETE FROM projects').run()
      database.prepare('DELETE FROM waveforms').run()
      database.prepare('DELETE FROM metadata').run()
      database.pragma(`user_version = ${databaseSchemaVersion}`)
    })()
  }
  return database
}

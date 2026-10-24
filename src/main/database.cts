import { app } from 'electron'
import Database from 'better-sqlite3'
import applicationIdentity from '#app-identity'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { applyMigrations } from './migrations/index.cjs'

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
  database.pragma('foreign_keys = ON')
  applyMigrations(database)
  return database
}

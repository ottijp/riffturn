import type Database from 'better-sqlite3'

export type Migration = {
  migrate: (database: Database.Database) => void
  version: number
}

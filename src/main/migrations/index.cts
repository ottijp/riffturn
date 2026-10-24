import type Database from 'better-sqlite3'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import type { Migration } from './types.cjs'

const migrationFilePattern = /^(\d{3})-[\w-]+\.cjs$/

function loadMigrations(): Migration[] {
  const migrations = readdirSync(__dirname)
    .sort()
    .flatMap((fileName) => {
      const match = migrationFilePattern.exec(fileName)
      if (!match) return []
      const migration = (require(path.join(__dirname, fileName)) as { migration?: Migration })
        .migration
      if (!migration || migration.version !== Number(match[1]))
        throw new Error(`Invalid migration file: ${fileName}`)
      return [migration]
    })
  if (new Set(migrations.map((migration) => migration.version)).size !== migrations.length)
    throw new Error('Duplicate migration version.')
  return migrations
}

export function applyMigrations(database: Database.Database): void {
  let userVersion = database.pragma('user_version', { simple: true }) as number
  for (const migration of loadMigrations()) {
    if (migration.version <= userVersion) continue
    database.transaction(() => {
      migration.migrate(database)
      database.pragma(`user_version = ${migration.version}`)
    })()
    userVersion = migration.version
  }
}

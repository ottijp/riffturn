import type { Migration } from './types.cjs'

export const migration: Migration = {
  version: 1,
  migrate(database) {
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
  },
}

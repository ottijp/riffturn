import type Database from 'better-sqlite3'
import type { Migration } from './types.cjs'

export const migration: Migration = { version: 6, migrate: migrateToVersion6 }

export function migrateToVersion6(database: Database.Database): void {
  database.exec(`
    CREATE TABLE loop_presets (
      project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      mode TEXT NOT NULL CHECK (mode IN ('none', 'time', 'segment')),
      time_start_seconds REAL,
      time_end_seconds REAL,
      start_segment_id TEXT,
      end_segment_id TEXT,
      PRIMARY KEY (project_id, name),
      CHECK (
        (mode = 'none' AND time_start_seconds IS NULL AND time_end_seconds IS NULL
          AND start_segment_id IS NULL AND end_segment_id IS NULL)
        OR (mode = 'time' AND time_start_seconds IS NOT NULL AND time_end_seconds IS NOT NULL
          AND time_start_seconds <= time_end_seconds
          AND start_segment_id IS NULL AND end_segment_id IS NULL)
        OR (mode = 'segment' AND time_start_seconds IS NULL AND time_end_seconds IS NULL
          AND start_segment_id IS NOT NULL AND end_segment_id IS NOT NULL)
      )
    );
  `)
}

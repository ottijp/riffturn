import type Database from 'better-sqlite3'
import { z } from 'zod'
import type { Migration } from './types.cjs'

const finiteNumberSchema = z.number().finite()

const legacyProjectRecordSchema = z.discriminatedUnion('isSample', [
  z.strictObject({
    projectId: z.string(),
    title: z.string(),
    description: z.string().default(''),
    duration: finiteNumberSchema,
    fileHash: z.string(),
    sourcePath: z.string(),
    isSample: z.literal(true),
    updatedAt: finiteNumberSchema,
    segments: z.array(
      z.strictObject({
        id: z.string(),
        label: z.string(),
        start: finiteNumberSchema,
        end: finiteNumberSchema,
        speed: finiteNumberSchema,
        gainDb: finiteNumberSchema,
      }),
    ),
    loopRange: z.tuple([finiteNumberSchema, finiteNumberSchema]),
    loopMode: z.enum(['none', 'segment', 'time']),
    masterGainDb: finiteNumberSchema,
    defaultDelayBeforeMs: finiteNumberSchema,
    defaultPrerollMs: finiteNumberSchema,
    defaultPostrollMs: finiteNumberSchema,
  }),
  z.strictObject({
    projectId: z.string(),
    title: z.string(),
    description: z.string().default(''),
    duration: finiteNumberSchema,
    fileHash: z.string(),
    sourcePath: z.string(),
    isSample: z.literal(false),
    updatedAt: finiteNumberSchema,
    segments: z.array(
      z.strictObject({
        id: z.string(),
        label: z.string(),
        start: finiteNumberSchema,
        end: finiteNumberSchema,
        speed: finiteNumberSchema,
        gainDb: finiteNumberSchema,
      }),
    ),
    loopRange: z.tuple([finiteNumberSchema, finiteNumberSchema]),
    loopMode: z.enum(['none', 'segment', 'time']),
    masterGainDb: finiteNumberSchema,
    defaultDelayBeforeMs: finiteNumberSchema,
    defaultPrerollMs: finiteNumberSchema,
    defaultPostrollMs: finiteNumberSchema,
  }),
])

function createVersion5Schema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE projects (
      project_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration REAL NOT NULL,
      file_hash TEXT NOT NULL,
      source_path TEXT NOT NULL,
      is_sample INTEGER NOT NULL CHECK (is_sample IN (0, 1)),
      updated_at INTEGER NOT NULL,
      master_gain_db REAL NOT NULL,
      default_delay_before_ms REAL NOT NULL,
      default_preroll_ms REAL NOT NULL,
      default_postroll_ms REAL NOT NULL
    );
    CREATE INDEX projects_file_hash ON projects(file_hash);
    CREATE TABLE segments (
      project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      segment_id TEXT NOT NULL,
      position INTEGER NOT NULL CHECK (position >= 0),
      label TEXT NOT NULL,
      start_seconds REAL NOT NULL,
      speed REAL NOT NULL,
      gain_db REAL NOT NULL,
      PRIMARY KEY (project_id, segment_id),
      UNIQUE (project_id, position)
    );
    CREATE TABLE project_loop_settings (
      project_id TEXT PRIMARY KEY NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
      mode TEXT NOT NULL CHECK (mode IN ('none', 'time', 'segment')),
      time_start_seconds REAL,
      time_end_seconds REAL,
      start_segment_id TEXT,
      end_segment_id TEXT,
      CHECK (
        (mode = 'none' AND time_start_seconds IS NULL AND time_end_seconds IS NULL
          AND start_segment_id IS NULL AND end_segment_id IS NULL)
        OR (mode = 'time' AND time_start_seconds IS NOT NULL AND time_end_seconds IS NOT NULL
          AND time_start_seconds <= time_end_seconds
          AND start_segment_id IS NULL AND end_segment_id IS NULL)
        OR (mode = 'segment' AND time_start_seconds IS NULL AND time_end_seconds IS NULL
          AND start_segment_id IS NOT NULL AND end_segment_id IS NOT NULL)
      ),
      FOREIGN KEY (project_id, start_segment_id)
        REFERENCES segments(project_id, segment_id),
      FOREIGN KEY (project_id, end_segment_id)
        REFERENCES segments(project_id, segment_id)
    );
  `)
}

function parseLegacyProject(payload: string) {
  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    throw new Error('Could not read persisted project data.')
  }
  const result = legacyProjectRecordSchema.safeParse(value)
  if (!result.success) throw new Error('Invalid persisted project data.')
  return result.data
}

export const migration: Migration = { version: 5, migrate: migrateToVersion5 }

export function migrateToVersion5(database: Database.Database): void {
  database.prepare('DROP INDEX IF EXISTS projects_file_hash').run()
  database.exec('ALTER TABLE projects RENAME TO legacy_projects')
  createVersion5Schema(database)
  const insertProject = database.prepare(`
    INSERT INTO projects(
      project_id, title, description, duration, file_hash, source_path, is_sample, updated_at,
      master_gain_db, default_delay_before_ms, default_preroll_ms, default_postroll_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertSegment = database.prepare(`
    INSERT INTO segments(
      project_id, segment_id, position, label, start_seconds, speed, gain_db
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertLoop = database.prepare(`
    INSERT INTO project_loop_settings(
      project_id, mode, time_start_seconds, time_end_seconds, start_segment_id, end_segment_id
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)
  const rows = database.prepare('SELECT payload FROM legacy_projects').all() as {
    payload: string
  }[]
  for (const row of rows) {
    const project = parseLegacyProject(row.payload)
    insertProject.run(
      project.projectId,
      project.title,
      project.description,
      project.duration,
      project.fileHash,
      project.sourcePath,
      Number(project.isSample),
      project.updatedAt,
      project.masterGainDb,
      project.defaultDelayBeforeMs,
      project.defaultPrerollMs,
      project.defaultPostrollMs,
    )
    for (const [position, segment] of project.segments.entries()) {
      insertSegment.run(
        project.projectId,
        segment.id,
        position,
        segment.label,
        segment.start,
        segment.speed,
        segment.gainDb,
      )
    }
    if (project.loopMode === 'time') {
      insertLoop.run(
        project.projectId,
        'time',
        project.loopRange[0],
        project.loopRange[1],
        null,
        null,
      )
      continue
    }
    if (project.loopMode === 'segment') {
      const start = project.segments.find((segment) => segment.start === project.loopRange[0])
      const end = project.segments.find((segment) => segment.end === project.loopRange[1])
      if (start && end) {
        insertLoop.run(project.projectId, 'segment', null, null, start.id, end.id)
        continue
      }
    }
    insertLoop.run(project.projectId, 'none', null, null, null, null)
  }
  database.exec('DROP TABLE legacy_projects')
}

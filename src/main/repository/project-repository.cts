import type { ApplicationDatabase } from '../database.cjs'
import { projectRecordSchema, projectSummarySchema } from '../../shared/project.js'
import type {
  LoopSettings,
  ProjectRecord,
  ProjectSummary,
  StoredSegment,
} from '../../shared/project.js'

type ProjectRow = {
  project_id: string
  title: string
  description: string
  duration: number
  file_hash: string
  source_path: string
  is_sample: number
  updated_at: number
  master_gain_db: number
  default_delay_before_ms: number
  default_preroll_ms: number
  default_postroll_ms: number
}

type ProjectSummaryRow = Pick<
  ProjectRow,
  'project_id' | 'title' | 'duration' | 'is_sample' | 'updated_at'
>

type SegmentRow = {
  project_id: string
  segment_id: string
  label: string
  start_seconds: number
  speed: number
  gain_db: number
}

type LoopRow = {
  project_id: string
  mode: string
  time_start_seconds: number | null
  time_end_seconds: number | null
  start_segment_id: string | null
  end_segment_id: string | null
}

function invalidLoopSettings(row: LoopRow | undefined, projectId?: string): Error {
  return new Error(
    `Invalid persisted loop settings. projectId=${row?.project_id ?? projectId ?? 'null'}, mode=${row?.mode ?? 'null'}, row=${JSON.stringify(row)}`,
  )
}

export interface ProjectRepository {
  delete(projectId: string): void
  findByHash(fileHash: string): ProjectRecord | null
  get(projectId: string): ProjectRecord | null
  hasSampleProjectsSeeded(): boolean
  list(): ProjectSummary[]
  markSampleProjectsSeeded(): void
  save(project: ProjectRecord): void
}

function loopSettingsFromRow(row: LoopRow): LoopSettings {
  if (row.mode === 'none') return { mode: 'none' }
  if (row.mode === 'time') {
    if (row.time_start_seconds === null || row.time_end_seconds === null)
      throw invalidLoopSettings(row)
    return { mode: 'time', startSeconds: row.time_start_seconds, endSeconds: row.time_end_seconds }
  }
  if (row.start_segment_id === null || row.end_segment_id === null) throw invalidLoopSettings(row)
  return { mode: 'segment', startSegmentId: row.start_segment_id, endSegmentId: row.end_segment_id }
}

function projectFromRows(row: ProjectRow, segments: SegmentRow[], loop: LoopRow): ProjectRecord {
  const result = projectRecordSchema.safeParse({
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    fileHash: row.file_hash,
    sourcePath: row.source_path,
    isSample: row.is_sample === 1,
    updatedAt: row.updated_at,
    segments: segments.map((segment, index): StoredSegment => ({
      id: segment.segment_id,
      label: segment.label,
      start: segment.start_seconds,
      end: segments[index + 1]?.start_seconds ?? row.duration,
      speed: segment.speed,
      gainDb: segment.gain_db,
    })),
    loopSettings: loopSettingsFromRow(loop),
    masterGainDb: row.master_gain_db,
    defaultDelayBeforeMs: row.default_delay_before_ms,
    defaultPrerollMs: row.default_preroll_ms,
    defaultPostrollMs: row.default_postroll_ms,
  })
  if (!result.success) throw new Error('Invalid persisted project data.')
  return result.data
}

export function createProjectRepository(database: ApplicationDatabase): ProjectRepository {
  const hasSampleProjectsSeeded = database.prepare(
    "SELECT 1 FROM metadata WHERE key = 'sample-projects-seeded'",
  )
  const markSampleProjectsSeeded = database.prepare(
    "INSERT INTO metadata(key, value) VALUES ('sample-projects-seeded', 'true')",
  )
  const listProjects = database.prepare<[], ProjectSummaryRow>(`
    SELECT project_id, title, duration, is_sample, updated_at
    FROM projects
    ORDER BY updated_at DESC
  `)
  const getProject = database.prepare<[string], ProjectRow>(
    'SELECT * FROM projects WHERE project_id = ?',
  )
  const findProjectByHash = database.prepare<[string], ProjectRow>(
    'SELECT * FROM projects WHERE file_hash = ? ORDER BY updated_at DESC LIMIT 1',
  )
  const listSegments = database.prepare<[string], SegmentRow>(
    'SELECT * FROM segments WHERE project_id = ? ORDER BY position ASC',
  )
  const getLoopSettings = database.prepare<[string], LoopRow>(
    'SELECT * FROM project_loop_settings WHERE project_id = ?',
  )
  const saveProject = database.prepare(`
    INSERT INTO projects(
      project_id, title, description, duration, file_hash, source_path, is_sample, updated_at,
      master_gain_db, default_delay_before_ms, default_preroll_ms, default_postroll_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      duration = excluded.duration,
      file_hash = excluded.file_hash,
      source_path = excluded.source_path,
      is_sample = excluded.is_sample,
      updated_at = excluded.updated_at,
      master_gain_db = excluded.master_gain_db,
      default_delay_before_ms = excluded.default_delay_before_ms,
      default_preroll_ms = excluded.default_preroll_ms,
      default_postroll_ms = excluded.default_postroll_ms
  `)
  const deleteLoopSettings = database.prepare(
    'DELETE FROM project_loop_settings WHERE project_id = ?',
  )
  const deleteSegments = database.prepare('DELETE FROM segments WHERE project_id = ?')
  const insertSegment = database.prepare(`
    INSERT INTO segments(
      project_id, segment_id, position, label, start_seconds, speed, gain_db
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertLoopSettings = database.prepare(`
    INSERT INTO project_loop_settings(
      project_id, mode, time_start_seconds, time_end_seconds, start_segment_id, end_segment_id
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)
  const deleteProject = database.prepare('DELETE FROM projects WHERE project_id = ?')

  const load = (row: ProjectRow | undefined): ProjectRecord | null => {
    if (!row) return null
    const loop = getLoopSettings.get(row.project_id)
    if (!loop) throw invalidLoopSettings(loop, row.project_id)
    return projectFromRows(row, listSegments.all(row.project_id), loop)
  }

  return {
    delete(projectId) {
      deleteProject.run(projectId)
    },
    findByHash(fileHash) {
      return load(findProjectByHash.get(fileHash))
    },
    get(projectId) {
      return load(getProject.get(projectId))
    },
    hasSampleProjectsSeeded() {
      return hasSampleProjectsSeeded.get() !== undefined
    },
    list() {
      return listProjects.all().map((row) => {
        const result = projectSummarySchema.safeParse({
          projectId: row.project_id,
          title: row.title,
          duration: row.duration,
          isSample: row.is_sample === 1,
          updatedAt: row.updated_at,
        })
        if (!result.success) throw new Error('Invalid persisted project summary data.')
        return result.data
      })
    },
    markSampleProjectsSeeded() {
      markSampleProjectsSeeded.run()
    },
    save: database.transaction((project: ProjectRecord) => {
      deleteLoopSettings.run(project.projectId)
      deleteSegments.run(project.projectId)
      saveProject.run(
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
      if (project.loopSettings.mode === 'time')
        insertLoopSettings.run(
          project.projectId,
          'time',
          project.loopSettings.startSeconds,
          project.loopSettings.endSeconds,
          null,
          null,
        )
      else if (project.loopSettings.mode === 'segment')
        insertLoopSettings.run(
          project.projectId,
          'segment',
          null,
          null,
          project.loopSettings.startSegmentId,
          project.loopSettings.endSegmentId,
        )
      else insertLoopSettings.run(project.projectId, 'none', null, null, null, null)
    }),
  }
}

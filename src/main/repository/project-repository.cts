import type { ApplicationDatabase } from '../database.cjs'
import { projectRecordSchema } from '../../shared/project.js'
import type { ProjectRecord } from '../../shared/project.js'

export interface ProjectRepository {
  delete(projectId: string): void
  findByHash(fileHash: string): ProjectRecord | null
  get(projectId: string): ProjectRecord | null
  hasSampleProjectsSeeded(): boolean
  list(): ProjectRecord[]
  markSampleProjectsSeeded(): void
  save(project: ProjectRecord): void
}

function parseProject(payload: string): ProjectRecord {
  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    throw new Error('プロジェクトの保存データを読み込めない．')
  }
  const result = projectRecordSchema.safeParse(value)
  if (!result.success) throw new Error('プロジェクトの保存データが不正です．')
  return result.data
}

export function createProjectRepository(database: ApplicationDatabase): ProjectRepository {
  const hasSampleProjectsSeeded = database.prepare(
    "SELECT 1 FROM metadata WHERE key = 'sample-projects-seeded'",
  )
  const markSampleProjectsSeeded = database.prepare(
    "INSERT INTO metadata(key, value) VALUES ('sample-projects-seeded', 'true')",
  )
  const listProjects = database.prepare('SELECT payload FROM projects ORDER BY updated_at DESC')
  const getProject = database.prepare('SELECT payload FROM projects WHERE project_id = ?')
  const findProjectByHash = database.prepare(
    'SELECT payload FROM projects WHERE file_hash = ? ORDER BY updated_at DESC LIMIT 1',
  )
  const saveProject = database.prepare(`
    INSERT INTO projects(project_id, file_hash, updated_at, payload) VALUES (?, ?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET
      file_hash = excluded.file_hash,
      updated_at = excluded.updated_at,
      payload = excluded.payload
  `)
  const deleteProject = database.prepare('DELETE FROM projects WHERE project_id = ?')

  return {
    delete(projectId) {
      deleteProject.run(projectId)
    },
    findByHash(fileHash) {
      const row = findProjectByHash.get(fileHash) as { payload: string } | undefined
      return row ? parseProject(row.payload) : null
    },
    get(projectId) {
      const row = getProject.get(projectId) as { payload: string } | undefined
      return row ? parseProject(row.payload) : null
    },
    hasSampleProjectsSeeded() {
      return hasSampleProjectsSeeded.get() !== undefined
    },
    list() {
      return (listProjects.all() as { payload: string }[]).map(({ payload }) =>
        parseProject(payload),
      )
    },
    markSampleProjectsSeeded() {
      markSampleProjectsSeeded.run()
    },
    save(project) {
      saveProject.run(
        project.projectId,
        project.fileHash,
        project.updatedAt,
        JSON.stringify(project),
      )
    },
  }
}

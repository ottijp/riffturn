import type Database from 'better-sqlite3'
import { sampleAssets } from '../sample-assets.cjs'
import type { Migration } from './types.cjs'

function migrateToVersion4(database: Database.Database): void {
  const descriptions = new Map(
    sampleAssets.map((asset) => [asset.projectId, asset.definition.description]),
  )
  const projects = database.prepare('SELECT project_id, payload FROM projects')
  const updateProject = database.prepare('UPDATE projects SET payload = ? WHERE project_id = ?')
  for (const row of projects.all() as { project_id: string; payload: string }[]) {
    const description = descriptions.get(row.project_id)
    if (description === undefined) continue
    let payload: { isSample?: unknown; description?: unknown }
    try {
      payload = JSON.parse(row.payload) as { isSample?: unknown; description?: unknown }
    } catch {
      continue
    }
    if (payload.isSample !== true || payload.description === description) continue
    payload.description = description
    updateProject.run(JSON.stringify(payload), row.project_id)
  }
}

export const migration: Migration = { version: 4, migrate: migrateToVersion4 }

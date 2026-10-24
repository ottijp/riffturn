import { ipcMain } from 'electron'
import {
  loopPresetReferenceSchema,
  projectRecordSchema,
  savedLoopPresetSchema,
} from '../../shared/project.js'
import type { ProjectRepository } from '../repository/project-repository.cjs'
import type { SampleProjectService } from '../sample-project-service.cjs'

export function registerProjectIpc(
  projects: ProjectRepository,
  samples: SampleProjectService,
): void {
  ipcMain.handle('projects:list', () => {
    return projects.list()
  })
  ipcMain.handle('projects:get', (_event, projectId: string) => {
    return projects.get(projectId)
  })
  ipcMain.handle('projects:save', (_event, project: unknown) => {
    const result = projectRecordSchema.safeParse(project)
    if (!result.success) throw new Error('Invalid project.')
    if (result.data.isSample) {
      if (!samples.isManagedPath(result.data.sourcePath))
        throw new Error('Invalid sample audio path.')
      const existing = projects.get(result.data.projectId)
      if (!existing?.isSample || existing.description !== result.data.description)
        throw new Error('The sample project description cannot be changed.')
    }
    projects.save(result.data)
  })
  ipcMain.handle('loop-presets:list', (_event, projectId: string) => {
    return projects.listLoopPresets(projectId)
  })
  ipcMain.handle('loop-presets:save', (_event, preset: unknown) => {
    const result = savedLoopPresetSchema.safeParse(preset)
    if (!result.success) throw new Error('Invalid loop preset.')
    if (!projects.get(result.data.projectId)) throw new Error('Project not found.')
    projects.saveLoopPreset(result.data)
  })
  ipcMain.handle('loop-presets:delete', (_event, preset: unknown) => {
    const result = loopPresetReferenceSchema.safeParse(preset)
    if (!result.success) throw new Error('Invalid loop preset.')
    projects.deleteLoopPreset(result.data.projectId, result.data.name)
  })
  ipcMain.handle('projects:delete', async (_event, projectId: string) => {
    const project = projects.get(projectId)
    if (!project) return
    projects.delete(projectId)
    if (project.isSample) {
      try {
        await samples.deleteAudio(project.sourcePath)
      } catch {
        // 削除済みのサンプルプロジェクトを再表示させないため，音源ファイルの後始末は失敗しても続行する．
      }
    }
  })
  ipcMain.handle('samples:add', () => {
    return samples.add()
  })
  ipcMain.handle('projects:find-by-hash', (_event, fileHash: string) => {
    return projects.findByHash(fileHash)
  })
}

import { ipcMain } from 'electron'
import { projectRecordSchema } from '../../shared/project.js'
import type { ProjectRepository } from '../repository/project-repository.cjs'
import type { SampleProjectService } from '../sample-project-service.cjs'

export function registerProjectIpc(
  projects: ProjectRepository,
  samples: SampleProjectService,
): void {
  ipcMain.handle('projects:list', () => {
    return projects.list()
  })
  ipcMain.handle('projects:save', (_event, project: unknown) => {
    const result = projectRecordSchema.safeParse(project)
    if (!result.success) throw new Error('プロジェクトが不正です．')
    if (result.data.isSample && !samples.isManagedPath(result.data.sourcePath))
      throw new Error('サンプル音源のパスが不正です．')
    projects.save(result.data)
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

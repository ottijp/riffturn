import { app } from 'electron'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { applicationDataPath } from './database.cjs'
import { sampleAssets } from './sample-assets.cjs'
import type { ProjectRepository } from './repository/project-repository.cjs'
import type { ProjectRecord } from '../shared/project.js'

export interface SampleProjectService {
  add(): Promise<ProjectRecord[]>
  deleteAudio(filePath: string): Promise<void>
  isManagedPath(filePath: string): boolean
  seedIfNeeded(): Promise<void>
}

function sampleDirectory(): string {
  return path.join(applicationDataPath(), 'samples')
}

function sampleAudioPath(fileName: string): string {
  return path.join(sampleDirectory(), fileName)
}

function bundledLibraryPath(): string {
  return path.join(app.getAppPath(), app.isPackaged ? 'dist' : 'public', 'library')
}

export function createSampleProjectService(projects: ProjectRepository): SampleProjectService {
  function isManagedPath(filePath: string): boolean {
    const relativePath = path.relative(sampleDirectory(), filePath)
    return (
      relativePath !== '' &&
      !relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== '..' &&
      !path.isAbsolute(relativePath)
    )
  }

  async function add(): Promise<ProjectRecord[]> {
    const added: ProjectRecord[] = []
    await fs.mkdir(sampleDirectory(), { recursive: true })
    for (const asset of sampleAssets) {
      if (projects.get(asset.projectId)) continue
      const sourcePath = sampleAudioPath(asset.audioFileName)
      await fs.copyFile(path.join(bundledLibraryPath(), asset.audioFileName), sourcePath)
      const project: ProjectRecord = {
        ...asset.definition,
        projectId: asset.projectId,
        sourcePath,
        isSample: true,
        updatedAt: 0,
      }
      projects.save(project)
      added.push(project)
    }
    return added
  }

  return {
    add,
    async deleteAudio(filePath) {
      if (!isManagedPath(filePath)) throw new Error('Invalid sample audio path.')
      try {
        await fs.unlink(filePath)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    },
    isManagedPath,
    async seedIfNeeded() {
      if (projects.hasSampleProjectsSeeded()) return
      await add()
      projects.markSampleProjectsSeeded()
    },
  }
}

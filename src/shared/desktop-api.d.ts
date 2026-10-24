import type { AudioFileDetails } from './audio-file.js'
import type {
  ProjectRecord,
  ProjectSummary,
  SavedLoopPreset,
  WaveformRecord,
} from './project.js'

export type DesktopApi = {
  getProject: (projectId: string) => Promise<ProjectRecord | null>
  listProjects: () => Promise<ProjectSummary[]>
  saveProject: (project: ProjectRecord) => Promise<void>
  listLoopPresets: (projectId: string) => Promise<SavedLoopPreset[]>
  saveLoopPreset: (preset: SavedLoopPreset) => Promise<void>
  deleteLoopPreset: (preset: Pick<SavedLoopPreset, 'projectId' | 'name'>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  addSampleProjects: () => Promise<ProjectRecord[]>
  findProjectByHash: (fileHash: string) => Promise<ProjectRecord | null>
  loadWaveform: (fileHash: string) => Promise<WaveformRecord | null>
  saveWaveform: (waveform: WaveformRecord) => Promise<void>
  chooseAudioFile: () => Promise<string | null>
  inspectAudioFile: (filePath: string) => Promise<AudioFileDetails>
  readAudioFile: (filePath: string) => Promise<Uint8Array>
}

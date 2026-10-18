import type { DesktopApi } from '../../shared/desktop-api'
import type { AudioFileDetails } from '../../shared/audio-file'
import type { ProjectRecord, WaveformRecord } from '../../shared/project'

export type { AudioFileDetails } from '../../shared/audio-file'

declare global {
  interface Window {
    riffturn?: DesktopApi
  }
}

function api(): DesktopApi {
  if (!window.riffturn) throw new Error('Launch RiffTurn as a desktop app.')
  return window.riffturn
}

export function chooseAudioFile(): Promise<string | null> {
  return api().chooseAudioFile()
}

export function inspectAudioFile(path: string): Promise<AudioFileDetails> {
  return api().inspectAudioFile(path)
}

export async function readAudioFile(path: string, name: string): Promise<File> {
  const bytes = await api().readAudioFile(path)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new File([copy.buffer], name, { type: audioMimeType(name) })
}

function audioMimeType(name: string): string {
  const extension = name.split('.').at(-1)?.toLowerCase()
  if (extension === 'wav') return 'audio/wav'
  if (extension === 'm4a') return 'audio/mp4'
  if (extension === 'aac') return 'audio/aac'
  return 'audio/mpeg'
}

export function listProjects(): Promise<ProjectRecord[]> {
  return api().listProjects()
}

export function saveProject(project: ProjectRecord): Promise<void> {
  return api().saveProject(project)
}

export function deleteProject(projectId: string): Promise<void> {
  return api().deleteProject(projectId)
}

export function addSampleProjects(): Promise<ProjectRecord[]> {
  return api().addSampleProjects()
}

export function findProjectByHash(fileHash: string): Promise<ProjectRecord | null> {
  return api().findProjectByHash(fileHash)
}

export function loadWaveform(fileHash: string): Promise<WaveformRecord | null> {
  return api().loadWaveform(fileHash)
}

export function saveWaveform(waveform: WaveformRecord): Promise<void> {
  return api().saveWaveform(waveform)
}

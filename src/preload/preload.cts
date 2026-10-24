import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi } from '../shared/desktop-api.js'

const api: DesktopApi = {
  getProject: (projectId) => ipcRenderer.invoke('projects:get', projectId),
  listProjects: () => ipcRenderer.invoke('projects:list'),
  saveProject: (project) => ipcRenderer.invoke('projects:save', project),
  deleteProject: (projectId) => ipcRenderer.invoke('projects:delete', projectId),
  addSampleProjects: () => ipcRenderer.invoke('samples:add'),
  findProjectByHash: (fileHash) => ipcRenderer.invoke('projects:find-by-hash', fileHash),
  loadWaveform: (fileHash) => ipcRenderer.invoke('waveforms:load', fileHash),
  saveWaveform: (waveform) => ipcRenderer.invoke('waveforms:save', waveform),
  chooseAudioFile: () => ipcRenderer.invoke('audio:choose'),
  inspectAudioFile: (filePath) => ipcRenderer.invoke('audio:inspect', filePath),
  readAudioFile: (filePath) => ipcRenderer.invoke('audio:read', filePath),
}

contextBridge.exposeInMainWorld('riffturn', api)

import { app, BrowserWindow } from 'electron'
import { openDatabase } from './database.cjs'
import { registerAudioIpc } from './audio-ipc.cjs'
import { createProjectRepository } from './project-repository.cjs'
import { registerProjectIpc } from './project-ipc.cjs'
import { registerRiffTurnProtocol, registerRiffTurnScheme } from './riffturn-protocol.cjs'
import { createSampleProjectService } from './sample-project-service.cjs'
import { createWaveformRepository } from './waveform-repository.cjs'
import { registerWaveformIpc } from './waveform-ipc.cjs'
import { createWindow } from './window.cjs'
import { configureMenu } from './menu.cjs'
import type { ApplicationDatabase } from './database.cjs'

let database: ApplicationDatabase

registerRiffTurnScheme()

app.whenReady().then(async () => {
  configureMenu()
  registerRiffTurnProtocol()
  database = await openDatabase()
  const projects = createProjectRepository(database)
  const waveforms = createWaveformRepository(database)
  const samples = createSampleProjectService(projects)
  await samples.seedIfNeeded()
  registerProjectIpc(projects, samples)
  registerWaveformIpc(waveforms)
  registerAudioIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('before-quit', () => database?.close())

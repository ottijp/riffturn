import { ipcMain } from 'electron'
import { waveformRecordSchema } from '../../shared/project.js'
import type { WaveformRepository } from '../repository/waveform-repository.cjs'

export function registerWaveformIpc(waveforms: WaveformRepository): void {
  ipcMain.handle('waveforms:load', (_event, fileHash: string) => {
    return waveforms.get(fileHash)
  })
  ipcMain.handle('waveforms:save', (_event, waveform: unknown) => {
    const result = waveformRecordSchema.safeParse(waveform)
    if (!result.success) throw new Error('波形が不正です．')
    waveforms.save(result.data)
  })
}

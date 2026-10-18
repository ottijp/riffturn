import { dialog, ipcMain } from 'electron'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export function registerAudioIpc(): void {
  ipcMain.handle('audio:choose', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'aac'] }],
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })
  ipcMain.handle('audio:inspect', async (_event, filePath: string) => {
    const metadata = await fs.stat(filePath)
    if (!metadata.isFile()) throw new Error('音源ファイルではない．')
    const bytes = await fs.readFile(filePath)
    return {
      path: filePath,
      name: path.basename(filePath),
      hash: createHash('sha256').update(bytes).digest('hex'),
    }
  })
  ipcMain.handle(
    'audio:read',
    async (_event, filePath: string) => new Uint8Array(await fs.readFile(filePath)),
  )
}

import { app, BrowserWindow } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

const defaultWidth = 1280
const defaultHeight = 820
const minimumWidth = 600
const minimumHeight = 400

const windowStateSchema = z.object({
  width: z.number().finite().min(minimumWidth),
  height: z.number().finite().min(minimumHeight),
})

function windowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadWindowState(): z.infer<typeof windowStateSchema> {
  try {
    const state: unknown = JSON.parse(readFileSync(windowStatePath(), 'utf8'))
    const result = windowStateSchema.safeParse(state)
    if (result.success) return result.data
  } catch {
    // 既定サイズを使用する．
  }
  return { width: defaultWidth, height: defaultHeight }
}

function saveWindowState(window: BrowserWindow): void {
  try {
    const { width, height } = window.getNormalBounds()
    mkdirSync(path.dirname(windowStatePath()), { recursive: true })
    writeFileSync(windowStatePath(), JSON.stringify({ width, height }))
  } catch {
    // ウィンドウの終了は保存失敗で妨げない．
  }
}

export function createWindow(): void {
  const { width, height } = loadWindowState()
  const window = new BrowserWindow({
    width,
    height,
    minWidth: minimumWidth,
    minHeight: minimumHeight,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'preload', 'preload.cjs'),
    },
  })

  window.on('close', () => saveWindowState(window))
  if (app.isPackaged) window.loadURL('riffturn://app/index.html')
  else window.loadURL('http://127.0.0.1:4321')
}

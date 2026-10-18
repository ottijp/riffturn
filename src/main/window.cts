import { app, BrowserWindow } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const defaultWidth = 1280
const defaultHeight = 820
const minimumWidth = 600
const minimumHeight = 400

interface WindowState {
  height: number
  width: number
}

function windowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function isValidDimension(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum
}

function loadWindowState(): WindowState {
  try {
    const state: unknown = JSON.parse(readFileSync(windowStatePath(), 'utf8'))
    if (
      typeof state === 'object' &&
      state !== null &&
      'width' in state &&
      'height' in state &&
      isValidDimension(state.width, minimumWidth) &&
      isValidDimension(state.height, minimumHeight)
    ) {
      return { width: state.width, height: state.height }
    }
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
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'preload', 'preload.cjs'),
    },
  })

  window.on('close', () => saveWindowState(window))
  if (app.isPackaged) window.loadURL('riffturn://app/index.html')
  else window.loadURL('http://127.0.0.1:4321')
}

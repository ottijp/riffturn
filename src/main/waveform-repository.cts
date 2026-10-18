import type { ApplicationDatabase } from './database.cjs'
import { waveformRecordSchema } from '../shared/project.js'
import type { WaveformRecord } from '../shared/project.js'

export interface WaveformRepository {
  get(fileHash: string): WaveformRecord | null
  save(waveform: WaveformRecord): void
}

function parseWaveform(payload: string): WaveformRecord {
  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    throw new Error('波形の保存データを読み込めない．')
  }
  const result = waveformRecordSchema.safeParse(value)
  if (!result.success) throw new Error('波形の保存データが不正です．')
  return result.data
}

export function createWaveformRepository(database: ApplicationDatabase): WaveformRepository {
  const getWaveform = database.prepare('SELECT payload FROM waveforms WHERE file_hash = ?')
  const saveWaveform = database.prepare(`
    INSERT INTO waveforms(file_hash, payload) VALUES (?, ?)
    ON CONFLICT(file_hash) DO UPDATE SET payload = excluded.payload
  `)

  return {
    get(fileHash) {
      const row = getWaveform.get(fileHash) as { payload: string } | undefined
      return row ? parseWaveform(row.payload) : null
    },
    save(waveform) {
      saveWaveform.run(waveform.fileHash, JSON.stringify(waveform))
    },
  }
}

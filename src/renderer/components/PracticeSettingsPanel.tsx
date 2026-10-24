import { useEffect, useState } from 'react'
import type { LoopMode, SavedLoopPreset, StoredSegment } from '../../shared/project'
import { formatDuration } from '../lib/format'
import { HelpTooltip } from './HelpTooltip'
import { LoopModeSelector } from './LoopModeSelector'
import { LoopPresetDialog } from './LoopPresetDialog'
import styles from './PracticeSettingsPanel.module.css'

type Boundary = 'start' | 'end'

type PracticeSettingsPanelProps = {
  currentTime: number
  defaultDelayBeforeMs: number
  defaultPostrollMs: number
  defaultPrerollMs: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  onDefaultDelayBeforeChange: (value: number) => void
  onDefaultPostrollChange: (value: number) => void
  onDefaultPrerollChange: (value: number) => void
  onLoopModeChange: (mode: LoopMode) => void
  onLoopRangeChange: (range: [number, number]) => void
  onDeleteLoopPreset: (name: string) => Promise<void>
  onLoadLoopPreset: (preset: SavedLoopPreset) => void
  onNotice: (message: string) => void
  onSaveLoopPreset: (name: string) => Promise<void>
  loopPresets: SavedLoopPreset[]
  segments: StoredSegment[]
}

export function PracticeSettingsPanel({
  currentTime,
  defaultDelayBeforeMs,
  defaultPostrollMs,
  defaultPrerollMs,
  duration,
  loopMode,
  loopRange,
  onDefaultDelayBeforeChange,
  onDefaultPostrollChange,
  onDefaultPrerollChange,
  onLoopModeChange,
  onLoopRangeChange,
  onDeleteLoopPreset,
  onLoadLoopPreset,
  onNotice,
  onSaveLoopPreset,
  loopPresets,
  segments,
}: PracticeSettingsPanelProps) {
  const [timeLoopStartDraft, setTimeLoopStartDraft] = useState(String(loopRange[0]))
  const [timeLoopEndDraft, setTimeLoopEndDraft] = useState(String(loopRange[1]))
  const [savePresetDialogOpen, setSavePresetDialogOpen] = useState(false)
  const [selectedPresetName, setSelectedPresetName] = useState('')
  const loopStartIndex = Math.max(
    0,
    segments.findIndex((segment) => loopRange[0] >= segment.start && loopRange[0] < segment.end),
  )
  const loopEndIndex = Math.max(
    loopStartIndex,
    segments.findIndex((segment) => loopRange[1] > segment.start && loopRange[1] <= segment.end),
  )

  useEffect(() => {
    if (loopMode !== 'time') return
    setTimeLoopStartDraft(String(loopRange[0]))
    setTimeLoopEndDraft(String(loopRange[1]))
  }, [loopMode, loopRange])

  const commitTimeLoopBoundary = (boundary: Boundary) => {
    const draft = boundary === 'start' ? timeLoopStartDraft : timeLoopEndDraft
    const value = Number(draft)
    if (draft.trim() === '' || !Number.isFinite(value)) {
      if (boundary === 'start') setTimeLoopStartDraft(String(loopRange[0]))
      else setTimeLoopEndDraft(String(loopRange[1]))
      return
    }
    const time = Math.max(0, Math.min(duration, value))
    if (
      (boundary === 'start' && time > loopRange[1]) ||
      (boundary === 'end' && time < loopRange[0])
    ) {
      onNotice('The start time must be before the end time.')
      if (boundary === 'start') setTimeLoopStartDraft(String(loopRange[0]))
      else setTimeLoopEndDraft(String(loopRange[1]))
      return
    }
    onLoopRangeChange(boundary === 'start' ? [time, loopRange[1]] : [loopRange[0], time])
  }

  const setTimeLoopBoundaryToCurrentTime = (boundary: Boundary) => {
    if (boundary === 'start') {
      onLoopRangeChange([currentTime, Math.max(currentTime, loopRange[1])])
      return
    }
    onLoopRangeChange([Math.min(loopRange[0], currentTime), currentTime])
  }

  const setLoopStartSegment = (index: number) => {
    const endIndex = Math.max(index, loopEndIndex)
    onLoopRangeChange([segments[index].start, segments[endIndex].end])
  }

  const setLoopEndSegment = (index: number) => {
    const startIndex = Math.min(index, loopStartIndex)
    onLoopRangeChange([segments[startIndex].start, segments[index].end])
  }

  return (
    <section className={styles.root} aria-label="Track practice settings">
      {savePresetDialogOpen && (
        <LoopPresetDialog
          onClose={() => setSavePresetDialogOpen(false)}
          onSave={onSaveLoopPreset}
        />
      )}
      <p className={styles.eyebrow}>PLAYBACK SETTINGS</p>
      <label>
        <span>
          <span className={styles.settingLabel}>
            Start delay{' '}
            <HelpTooltip label="About start delay">
              Wait for the specified number of seconds before playback starts.
            </HelpTooltip>
          </span>
          <output>{(defaultDelayBeforeMs / 1000).toFixed(1)} s</output>
        </span>
        <input
          type="range"
          min="0"
          max="10"
          step=".5"
          value={defaultDelayBeforeMs / 1000}
          onChange={(event) => onDefaultDelayBeforeChange(Number(event.target.value) * 1000)}
        />
      </label>
      <label>
        <span>
          <span className={styles.settingLabel}>
            Preroll{' '}
            <HelpTooltip label="About preroll">
              Play from before the start of the loop range to hear the lead-in.
            </HelpTooltip>
          </span>
          <output>{defaultPrerollMs / 1000} s</output>
        </span>
        <input
          type="range"
          min="0"
          max="10"
          step=".5"
          value={defaultPrerollMs / 1000}
          onChange={(event) => onDefaultPrerollChange(Number(event.target.value) * 1000)}
        />
      </label>
      <label>
        <span>
          <span className={styles.settingLabel}>
            Postroll{' '}
            <HelpTooltip label="About postroll">
              Continue playing for the specified number of seconds after the loop range before
              repeating.
            </HelpTooltip>
          </span>
          <output>{defaultPostrollMs / 1000} s</output>
        </span>
        <input
          type="range"
          min="0"
          max="10"
          step=".5"
          value={defaultPostrollMs / 1000}
          onChange={(event) => onDefaultPostrollChange(Number(event.target.value) * 1000)}
        />
      </label>
      <div className={styles.loopSettings}>
        <div className={styles.loopSettingsHeader}>
          <div>
            <span className={styles.loopSettingsLabel}>LOOP</span>
            <strong>
              {loopMode === 'none'
                ? 'No loop'
                : loopMode === 'segment'
                  ? 'Segment range'
                  : 'Time range'}
            </strong>
          </div>
          <LoopModeSelector mode={loopMode} onChange={onLoopModeChange} />
        </div>
        <div className={styles.presetActions}>
          <button
            type="button"
            disabled={loopMode === 'none'}
            title={loopMode === 'none' ? 'Set a loop range before saving.' : undefined}
            onClick={() => setSavePresetDialogOpen(true)}
          >
            Save as
          </button>
          <select
            aria-label="Load saved loop setting"
            value={selectedPresetName}
            onChange={(event) => {
              const preset = loopPresets.find((item) => item.name === event.target.value)
              setSelectedPresetName(event.target.value)
              if (preset) onLoadLoopPreset(preset)
            }}
          >
            <option value="">Load…</option>
            {loopPresets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedPresetName}
            onClick={() => {
              if (!window.confirm(`Delete “${selectedPresetName}”?`)) return
              void onDeleteLoopPreset(selectedPresetName)
                .then(() => setSelectedPresetName(''))
                .catch(() => onNotice('Could not delete this loop setting.'))
            }}
          >
            Delete
          </button>
        </div>
        {loopMode === 'none' && (
          <p className={styles.loopDisabled}>
            Play from the current position to the end of the track.
          </p>
        )}
        {loopMode === 'segment' && (
          <div className={styles.loopSegmentControls}>
            <label>
              <span>Start</span>
              <select
                value={loopStartIndex}
                onChange={(event) => setLoopStartSegment(Number(event.target.value))}
              >
                {segments.map((segment, index) => (
                  <option key={segment.id} value={index}>
                    {segment.label} · {formatDuration(segment.start)}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.loopRangeArrow} aria-hidden="true">
              →
            </span>
            <label>
              <span>End</span>
              <select
                value={loopEndIndex}
                onChange={(event) => setLoopEndSegment(Number(event.target.value))}
              >
                {segments.map((segment, index) => (
                  <option key={segment.id} value={index}>
                    {segment.label} · {formatDuration(segment.end)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {loopMode === 'time' && (
          <div className={styles.loopSegmentControls}>
            <label>
              <span>Start</span>
              <div className={styles.timeLoopInput}>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label="Loop start time"
                  value={timeLoopStartDraft}
                  onChange={(event) => setTimeLoopStartDraft(event.target.value)}
                  onBlur={() => commitTimeLoopBoundary('start')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                    if (event.key === 'Escape') setTimeLoopStartDraft(String(loopRange[0]))
                  }}
                />
                <button type="button" onClick={() => setTimeLoopBoundaryToCurrentTime('start')}>
                  Current position
                </button>
              </div>
            </label>
            <span className={styles.loopRangeArrow} aria-hidden="true">
              →
            </span>
            <label>
              <span>End</span>
              <div className={styles.timeLoopInput}>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label="Loop end time"
                  value={timeLoopEndDraft}
                  onChange={(event) => setTimeLoopEndDraft(event.target.value)}
                  onBlur={() => commitTimeLoopBoundary('end')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                    if (event.key === 'Escape') setTimeLoopEndDraft(String(loopRange[1]))
                  }}
                />
                <button type="button" onClick={() => setTimeLoopBoundaryToCurrentTime('end')}>
                  Current position
                </button>
              </div>
            </label>
          </div>
        )}
      </div>
    </section>
  )
}

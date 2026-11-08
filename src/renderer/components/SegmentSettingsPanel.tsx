import { Plus, Trash2 } from 'lucide-react'
import type { StoredSegment } from '../../shared/project'
import { formatDuration, formatGainDb } from '../lib/format'
import { EditableName } from './EditableName'
import styles from './SegmentSettingsPanel.module.css'
import { IconButton } from './Button'

type SegmentSettingsPanelProps = {
  onAdd: () => void
  onSelect: (segment: StoredSegment) => void
  segments: StoredSegment[]
  onDelete: () => void
  onGainChange: (gainDb: number) => void
  onNameChange: (name: string) => void
  onSpeedChange: (speed: number) => void
  playbackSpeedSteps: readonly number[]
  segment: StoredSegment
}

export function SegmentSettingsPanel({
  onAdd,
  onSelect,
  segments,
  onDelete,
  onGainChange,
  onNameChange,
  onSpeedChange,
  playbackSpeedSteps,
  segment,
}: SegmentSettingsPanelProps) {
  const speedIndex = playbackSpeedSteps.reduce(
    (closestIndex, candidate, index) =>
      Math.abs(candidate - segment.speed) <
      Math.abs(playbackSpeedSteps[closestIndex] - segment.speed)
        ? index
        : closestIndex,
    0,
  )

  return (
    <section className={styles.root} aria-label="Segment settings">
      <p className={styles.eyebrow}>SEGMENT SETTINGS</p>
      <div className={styles.selectGroup}>
        <label className={styles.selectLabel} htmlFor="segment-select">
          Segment
        </label>
        <div className={styles.selectRow}>
          <select
            id="segment-select"
            value={segment.id}
            onChange={(event) => {
              const selected = segments.find((item) => item.id === event.target.value)
              if (selected) onSelect(selected)
            }}
          >
            {segments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {formatDuration(item.start)}
              </option>
            ))}
          </select>
          <IconButton
            aria-label="Add segment at playback position"
            className={styles.addButton}
            title="Add segment at playback position"
            onClick={onAdd}
          >
            <Plus aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <EditableName
        key={segment.id}
        ariaLabel="Segment name"
        className={styles.title}
        heading="h2"
        value={segment.label}
        onCommit={onNameChange}
      />
      <div className={styles.range}>
        <span>{formatDuration(segment.start)}</span>
        <span>—</span>
        <span>{formatDuration(segment.end)}</span>
      </div>
      <div className={styles.controls}>
        <label className={styles.control}>
          <span>
            Playback speed <output>{segment.speed.toFixed(2)}×</output>
          </span>
          <input
            type="range"
            min="0"
            max={playbackSpeedSteps.length - 1}
            step="1"
            value={speedIndex}
            onChange={(event) => onSpeedChange(playbackSpeedSteps[Number(event.target.value)] ?? 1)}
          />
        </label>
        <label className={styles.control}>
          <span>
            Volume <output>{formatGainDb(segment.gainDb)}</output>
          </span>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={segment.gainDb}
            onChange={(event) => onGainChange(Number(event.target.value))}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <IconButton
          aria-label={`Delete ${segment.label}`}
          title={`Delete ${segment.label}`}
          variant="danger"
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </div>
    </section>
  )
}

import type { StoredSegment } from '../../shared/project'
import { formatDuration, formatGainDb } from '../lib/format'
import { EditableName } from './EditableName'
import styles from './SegmentSettingsDialog.module.css'
import { Button } from './Button'
import { Dialog } from './Dialog'

type SegmentSettingsDialogProps = {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  onGainChange: (gainDb: number) => void
  onNameChange: (name: string) => void
  onSpeedChange: (speed: number) => void
  playbackSpeedSteps: readonly number[]
  segment: StoredSegment
}

export function SegmentSettingsDialog({
  isOpen,
  onClose,
  onDelete,
  onGainChange,
  onNameChange,
  onSpeedChange,
  playbackSpeedSteps,
  segment,
}: SegmentSettingsDialogProps) {
  if (!isOpen) return null

  const speedIndex = playbackSpeedSteps.reduce(
    (closestIndex, candidate, index) =>
      Math.abs(candidate - segment.speed) <
      Math.abs(playbackSpeedSteps[closestIndex] - segment.speed)
        ? index
        : closestIndex,
    0,
  )

  return (
    <Dialog
      closeLabel="Close segment editor"
      header={
        <div>
          <p className={styles.eyebrow}>SEGMENT DETAILS</p>
          <EditableName
            ariaLabel="Segment name"
            className={styles.title}
            heading="h2"
            headingId="segment-settings-title"
            value={segment.label}
            onCommit={onNameChange}
          />
        </div>
      }
      onClose={onClose}
      size="narrow"
      titleId="segment-settings-title"
    >
      <div className={styles.range}>
        <span>{formatDuration(segment.start)}</span>
        <span>—</span>
        <span>{formatDuration(segment.end)}</span>
      </div>
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
      <div className={styles.actions}>
        <Button className={styles.deleteButton} fullWidth variant="danger" onClick={onDelete}>
          Delete this segment
        </Button>
      </div>
    </Dialog>
  )
}

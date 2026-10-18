import type { StoredSegment } from '../../shared/project'
import { formatGainDb } from '../lib/format'
import styles from './TimelineToolbar.module.css'

type TimelineToolbarProps = {
  activeSegment: StoredSegment
  onAddSegment: () => void
  onSelectSegment: (segment: StoredSegment) => void
  segments: StoredSegment[]
}

export function TimelineToolbar({
  activeSegment,
  onAddSegment,
  onSelectSegment,
  segments,
}: TimelineToolbarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.segmentActions}>
        <button className={styles.addSegmentButton} onClick={onAddSegment}>
          Add segment at playback position
        </button>
        <p className={styles.status}>
          {activeSegment.label} · {Math.round(activeSegment.speed * 100)}% speed ·{' '}
          {formatGainDb(activeSegment.gainDb)}
        </p>
      </div>
      <select
        className={styles.segmentSelect}
        aria-label="Segment settings"
        value=""
        onChange={(event) => {
          const segment = segments.find((item) => item.id === event.target.value)
          if (segment) onSelectSegment(segment)
        }}
      >
        <option value="" disabled>
          Segment settings
        </option>
        {segments.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.label}
          </option>
        ))}
      </select>
    </div>
  )
}

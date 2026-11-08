import type { StoredSegment } from '../../shared/project'
import { formatGainDb } from '../lib/format'
import styles from './TimelineToolbar.module.css'

export function TimelineToolbar({ activeSegment }: { activeSegment: StoredSegment }) {
  return (
    <div className={styles.root}>
      <p className={styles.status}>
        {activeSegment.label} · {activeSegment.speed.toFixed(2)}× ·{' '}
        {formatGainDb(activeSegment.gainDb)}
      </p>
    </div>
  )
}

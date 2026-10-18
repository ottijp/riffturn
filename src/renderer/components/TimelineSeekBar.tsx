import type { CSSProperties } from 'react'
import type { StoredSegment } from '../../shared/project'
import { formatDuration } from '../lib/format'
import styles from './TimelineSeekBar.module.css'

type TimelineSeekBarProps = {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  segments: StoredSegment[]
}

export function TimelineSeekBar({ currentTime, duration, onSeek, segments }: TimelineSeekBarProps) {
  const progressStyle = {
    '--seek-progress': `${(currentTime / duration) * 100}%`,
  } as CSSProperties

  return (
    <div className={styles.root}>
      <div className={styles.labels}>
        <span className={styles.currentTime}>{formatDuration(currentTime)}</span>
        <span className={styles.duration}>{formatDuration(duration)}</span>
      </div>
      <input
        aria-label="Playback position"
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={currentTime}
        style={progressStyle}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <div className={styles.segmentDividers} aria-hidden="true">
        {segments.slice(1).map((segment) => (
          <span key={segment.id} style={{ left: `${(segment.start / duration) * 100}%` }} />
        ))}
      </div>
    </div>
  )
}

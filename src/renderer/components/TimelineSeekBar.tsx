import type { CSSProperties } from 'react'
import type { LoopMode, StoredSegment } from '../../shared/project'
import styles from './TimelineSeekBar.module.css'

type TimelineSeekBarProps = {
  currentTime: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  onSeek: (time: number) => void
  segments: StoredSegment[]
}

export function TimelineSeekBar({
  currentTime,
  duration,
  loopMode,
  loopRange,
  onSeek,
  segments,
}: TimelineSeekBarProps) {
  const progressStyle = {
    '--seek-progress': `${(currentTime / duration) * 100}%`,
  } as CSSProperties

  return (
    <div className={styles.root}>
      <input
        aria-label="Playback position"
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={currentTime}
        style={progressStyle}
        aria-description={
          loopMode === 'none' ? undefined : 'Seeking is limited to the current loop range.'
        }
        onChange={(event) => {
          const time = Number(event.target.value)
          onSeek(loopMode === 'none' ? time : Math.max(loopRange[0], Math.min(loopRange[1], time)))
        }}
      />
      <div className={styles.segmentDividers} aria-hidden="true">
        {segments.slice(1).map((segment) => (
          <span key={segment.id} style={{ left: `${(segment.start / duration) * 100}%` }} />
        ))}
      </div>
      {loopMode !== 'none' && duration > 0 && (
        <>
          <div
            aria-hidden="true"
            className={styles.unavailable}
            data-tooltip="Seeking is limited to the current loop range."
            style={{
              left: 0,
              width: `${(Math.max(0, Math.min(duration, loopRange[0])) / duration) * 100}%`,
            }}
          />
          <div
            aria-hidden="true"
            className={styles.unavailable}
            data-tooltip="Seeking is limited to the current loop range."
            style={{
              right: 0,
              width: `${((duration - Math.max(0, Math.min(duration, loopRange[1]))) / duration) * 100}%`,
            }}
          />
        </>
      )}
    </div>
  )
}

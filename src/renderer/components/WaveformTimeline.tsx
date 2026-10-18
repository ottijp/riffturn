import { Fragment, type RefObject } from 'react'
import type { LoopMode, StoredSegment } from '../../shared/project'
import styles from './WaveformTimeline.module.css'

type WaveformTimelineProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  currentTime: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  onOpenSettings: (segment: StoredSegment) => void
  onSelect: (segment: StoredSegment) => void
  postrollEnd: number
  prerollStart: number
  segments: StoredSegment[]
}

export function WaveformTimeline({
  canvasRef,
  currentTime,
  duration,
  loopMode,
  loopRange,
  onOpenSettings,
  onSelect,
  postrollEnd,
  prerollStart,
  segments,
}: WaveformTimelineProps) {
  const rangeStyle = (start: number, end: number) => ({
    left: `${(Math.max(0, start) / duration) * 100}%`,
    width: `${(Math.max(0, end - start) / duration) * 100}%`,
  })

  return (
    <div className={styles.root} aria-label="Audio timeline">
      <canvas ref={canvasRef} className={styles.canvas} />
      {loopMode !== 'none' && (
        <>
          <span className={styles.prerollRange} style={rangeStyle(prerollStart, loopRange[0])} />
          <span className={styles.loopRange} style={rangeStyle(loopRange[0], loopRange[1])} />
          <span className={styles.postrollRange} style={rangeStyle(loopRange[1], postrollEnd)} />
        </>
      )}
      {segments.map((segment) => (
        <Fragment key={segment.id}>
          <button
            aria-label={`Go to the start of ${segment.label}`}
            onClick={() => onSelect(segment)}
            className={styles.segment}
            style={{
              left: `${(segment.start / duration) * 100}%`,
              width: `${((segment.end - segment.start) / duration) * 100}%`,
            }}
          >
            <span>{segment.label}</span>
          </button>
          <button
            className={styles.settingsButton}
            aria-label={`Edit ${segment.label}`}
            title={`Edit ${segment.label}`}
            style={{ left: `${(segment.end / duration) * 100}%` }}
            onClick={() => onOpenSettings(segment)}
          >
            ⚙
          </button>
        </Fragment>
      ))}
      <span className={styles.playhead} style={{ left: `${(currentTime / duration) * 100}%` }} />
    </div>
  )
}

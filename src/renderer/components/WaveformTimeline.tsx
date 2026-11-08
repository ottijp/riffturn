import type { RefObject } from 'react'
import type { LoopMode, StoredSegment } from '../../shared/project'
import styles from './WaveformTimeline.module.css'
import { Button } from './Button'

type WaveformTimelineProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  currentTime: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  onSelect: (segment: StoredSegment) => void
  onSeekToSegment: (segment: StoredSegment) => void
  postrollEnd: number
  prerollStart: number
  segments: StoredSegment[]
  selectedSegmentId: string
}

export function WaveformTimeline({
  canvasRef,
  currentTime,
  duration,
  loopMode,
  loopRange,
  onSelect,
  onSeekToSegment,
  postrollEnd,
  prerollStart,
  segments,
  selectedSegmentId,
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
        <Button
          key={segment.id}
          aria-label={`Select ${segment.label}`}
          aria-pressed={segment.id === selectedSegmentId}
          title={`Select ${segment.label}; double-click or Shift+Enter to seek to its start`}
          onClick={() => onSelect(segment)}
          onDoubleClick={() => onSeekToSegment(segment)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.shiftKey) {
              event.preventDefault()
              onSelect(segment)
              onSeekToSegment(segment)
            }
          }}
          className={styles.segment}
          variant="ghost"
          style={{
            left: `${(segment.start / duration) * 100}%`,
            width: `${((segment.end - segment.start) / duration) * 100}%`,
          }}
        >
          <span>{segment.label}</span>
        </Button>
      ))}
      <span className={styles.playhead} style={{ left: `${(currentTime / duration) * 100}%` }} />
    </div>
  )
}

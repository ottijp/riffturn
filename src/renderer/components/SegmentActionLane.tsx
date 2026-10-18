import { Repeat2 } from 'lucide-react'
import type { LoopMode, StoredSegment } from '../../shared/project'
import { formatGainDb } from '../lib/format'
import styles from './SegmentActionLane.module.css'

type SegmentActionLaneProps = {
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  onSetSingleSegmentLoop: (segment: StoredSegment) => void
  segments: StoredSegment[]
}

export function SegmentActionLane({
  duration,
  loopMode,
  loopRange,
  onSetSingleSegmentLoop,
  segments,
}: SegmentActionLaneProps) {
  return (
    <div className={styles.root} aria-label="Segment loop settings">
      {segments.map((segment) => {
        const isLoopTarget =
          loopMode === 'segment' && loopRange[0] === segment.start && loopRange[1] === segment.end
        return (
          <div
            key={segment.id}
            className={styles.slot}
            style={{
              left: `${(segment.start / duration) * 100}%`,
              width: `${((segment.end - segment.start) / duration) * 100}%`,
            }}
          >
            <span className={styles.meta}>
              {segment.speed.toFixed(2)}× · {formatGainDb(segment.gainDb)}
            </span>
            <button
              className={`${styles.loopButton} ${isLoopTarget ? styles.active : ''}`}
              aria-label={`Set ${segment.label} as the loop range and play`}
              title={`Set ${segment.label} as the loop range and play`}
              onClick={() => onSetSingleSegmentLoop(segment)}
            >
              <Repeat2 aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

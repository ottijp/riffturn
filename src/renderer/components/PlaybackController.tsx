import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react'
import type { LoopMode } from '../../shared/project'
import { formatGainDb } from '../lib/format'
import styles from './PlaybackController.module.css'

type PlaybackControllerProps = {
  audioLoading: boolean
  currentTime: number
  duration: number
  formatTime: (value: number) => string
  loopMode: LoopMode
  masterGainDb: number
  onMasterGainChange: (gainDb: number) => void
  onMoveSegment: (offset: -1 | 1) => void
  onSeek: (time: number, source: 'skip-back' | 'skip-forward') => void
  onStartPractice: () => void
  onTogglePlayback: () => void
  playing: boolean
  projectsLoading: boolean
  selectedIndex: number
  segmentCount: number
}

export function PlaybackController({
  audioLoading,
  currentTime,
  duration,
  formatTime,
  loopMode,
  masterGainDb,
  onMasterGainChange,
  onMoveSegment,
  onSeek,
  onStartPractice,
  onTogglePlayback,
  playing,
  projectsLoading,
  selectedIndex,
  segmentCount,
}: PlaybackControllerProps) {
  const isLoading = projectsLoading || audioLoading

  return (
    <div className={styles.transport}>
      <div className={styles.left}>
        <button
          aria-label="Play from the start of the loop range"
          title={loopMode === 'none' ? 'Set a loop range' : 'Practice from loop start'}
          className={styles.iconButton}
          disabled={loopMode === 'none' || isLoading}
          onClick={onStartPractice}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className={styles.playback}>
        <button
          className={styles.iconButton}
          onClick={() => onMoveSegment(-1)}
          aria-label="Go to previous segment"
        >
          <StepBack aria-hidden="true" />
        </button>
        <button
          className={`${styles.iconButton} ${styles.seekButton}`}
          onClick={() => onSeek(Math.max(0, currentTime - 10), 'skip-back')}
          aria-label="Go back 10 seconds"
        >
          −10s
        </button>
        <button
          aria-label={
            projectsLoading
              ? 'Preparing projects'
              : audioLoading
                ? 'Loading audio'
                : playing
                  ? 'Pause'
                  : 'Play'
          }
          aria-busy={isLoading}
          className={styles.playButton}
          disabled={isLoading}
          onClick={onTogglePlayback}
        >
          {isLoading ? (
            <span className={styles.loadingIndicator} aria-hidden="true" />
          ) : playing ? (
            <Pause aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          )}
        </button>
        <button
          className={`${styles.iconButton} ${styles.seekButton}`}
          onClick={() => onSeek(Math.min(duration, currentTime + 10), 'skip-forward')}
          aria-label="Go forward 10 seconds"
        >
          +10s
        </button>
        <button
          className={styles.iconButton}
          disabled={selectedIndex >= segmentCount - 1}
          onClick={() => onMoveSegment(1)}
          aria-label="Go to next segment"
        >
          <StepForward aria-hidden="true" />
        </button>
      </div>
      <div className={styles.right}>
        <div className={styles.now}>
          <span className={styles.currentTime}>{formatTime(currentTime)}</span>
          <span className={styles.duration}>/ {formatTime(duration)}</span>
        </div>
        <label className={styles.masterVolume}>
          <span>
            MASTER <output>{formatGainDb(masterGainDb)}</output>
          </span>
          <input
            aria-label="Master volume"
            type="range"
            min="-48"
            max="24"
            step="1"
            value={masterGainDb}
            onChange={(event) => onMasterGainChange(Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  )
}

import { formatDuration } from '../lib/format'
import type { LoopMode, SavedLoopPreset, StoredSegment } from '../../shared/project'
import { PlaybackController } from './PlaybackController'
import { PracticeSettingsPanel } from './PracticeSettingsPanel'
import { SegmentActionLane } from './SegmentActionLane'
import { SegmentSettingsPanel } from './SegmentSettingsPanel'
import { TimelineSeekBar } from './TimelineSeekBar'
import { TimelineToolbar } from './TimelineToolbar'
import { WaveformTimeline } from './WaveformTimeline'
import styles from './TimelineWorkspace.module.css'

type TimelineWorkspaceProps = {
  activeSegment: StoredSegment
  audioLoading: boolean
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  currentTime: number
  defaultDelayBeforeMs: number
  defaultPostrollMs: number
  defaultPrerollMs: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  masterGainDb: number
  onAddSegment: () => void
  onDefaultDelayBeforeChange: (value: number) => void
  onDefaultPostrollChange: (value: number) => void
  onDefaultPrerollChange: (value: number) => void
  onDeleteSegment: () => void
  onDeleteLoopPreset: (name: string) => Promise<void>
  onLoopModeChange: (mode: LoopMode) => void
  onLoopRangeChange: (range: [number, number]) => void
  onLoadLoopPreset: (preset: SavedLoopPreset) => void
  onMasterGainChange: (gainDb: number) => void
  onMoveSegment: (offset: -1 | 1) => void
  onNotice: (message: string) => void
  onOpenSegmentSettings: (segment: StoredSegment) => void
  onSeek: (time: number, source: 'seekbar' | 'skip-back' | 'skip-forward') => void
  onSegmentGainChange: (gainDb: number) => void
  onSegmentNameChange: (label: string) => void
  onSegmentSpeedChange: (speed: number) => void
  onSeekToTimelineSegment: (segment: StoredSegment) => void
  onSetSingleSegmentLoop: (segment: StoredSegment) => void
  onSaveLoopPreset: (name: string) => Promise<void>
  onStartPractice: () => void
  onTogglePlayback: () => void
  playing: boolean
  postrollEnd: number
  prerollStart: number
  projectsLoading: boolean
  segmentCount: number
  segments: StoredSegment[]
  selectedIndex: number
  selectedSegment: StoredSegment
  loopPresets: SavedLoopPreset[]
  visualLoopRange: [number, number]
}

export function TimelineWorkspace({
  activeSegment,
  audioLoading,
  canvasRef,
  currentTime,
  defaultDelayBeforeMs,
  defaultPostrollMs,
  defaultPrerollMs,
  duration,
  loopMode,
  loopRange,
  masterGainDb,
  onAddSegment,
  onDefaultDelayBeforeChange,
  onDefaultPostrollChange,
  onDefaultPrerollChange,
  onDeleteSegment,
  onDeleteLoopPreset,
  onLoopModeChange,
  onLoopRangeChange,
  onLoadLoopPreset,
  onMasterGainChange,
  onMoveSegment,
  onNotice,
  onOpenSegmentSettings,
  onSeek,
  onSegmentGainChange,
  onSegmentNameChange,
  onSegmentSpeedChange,
  onSeekToTimelineSegment,
  onSetSingleSegmentLoop,
  onSaveLoopPreset,
  onStartPractice,
  onTogglePlayback,
  playing,
  postrollEnd,
  prerollStart,
  projectsLoading,
  segmentCount,
  segments,
  selectedIndex,
  selectedSegment,
  loopPresets,
  visualLoopRange,
}: TimelineWorkspaceProps) {
  return (
    <section className={styles.root}>
      <div className={styles.waveCard}>
        <TimelineToolbar activeSegment={activeSegment} />
        <WaveformTimeline
          canvasRef={canvasRef}
          currentTime={currentTime}
          duration={duration}
          loopMode={loopMode}
          loopRange={visualLoopRange}
          postrollEnd={postrollEnd}
          prerollStart={prerollStart}
          segments={segments}
          onSelect={onOpenSegmentSettings}
          onSeekToSegment={onSeekToTimelineSegment}
          selectedSegmentId={selectedSegment.id}
        />
        <SegmentActionLane
          duration={duration}
          loopMode={loopMode}
          loopRange={loopRange}
          segments={segments}
          onSetSingleSegmentLoop={onSetSingleSegmentLoop}
        />
        <TimelineSeekBar
          currentTime={currentTime}
          duration={duration}
          loopMode={loopMode}
          loopRange={loopRange}
          segments={segments}
          onSeek={(time) => onSeek(time, 'seekbar')}
        />
      </div>
      <PlaybackController
        audioLoading={audioLoading}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatDuration}
        loopMode={loopMode}
        masterGainDb={masterGainDb}
        onMasterGainChange={onMasterGainChange}
        onMoveSegment={onMoveSegment}
        onSeek={onSeek}
        onStartPractice={onStartPractice}
        onTogglePlayback={onTogglePlayback}
        playing={playing}
        projectsLoading={projectsLoading}
        selectedIndex={selectedIndex}
        segmentCount={segmentCount}
      />
      <section className={styles.lowerControls}>
        <SegmentSettingsPanel
          playbackSpeedSteps={playbackSpeedSteps}
          segment={selectedSegment}
          segments={segments}
          onAdd={onAddSegment}
          onSelect={onOpenSegmentSettings}
          onDelete={onDeleteSegment}
          onGainChange={onSegmentGainChange}
          onNameChange={onSegmentNameChange}
          onSpeedChange={onSegmentSpeedChange}
        />
        <PracticeSettingsPanel
          currentTime={currentTime}
          defaultDelayBeforeMs={defaultDelayBeforeMs}
          defaultPostrollMs={defaultPostrollMs}
          defaultPrerollMs={defaultPrerollMs}
          duration={duration}
          loopMode={loopMode}
          loopRange={loopRange}
          segments={segments}
          onDefaultDelayBeforeChange={onDefaultDelayBeforeChange}
          onDefaultPostrollChange={onDefaultPostrollChange}
          onDefaultPrerollChange={onDefaultPrerollChange}
          onDeleteLoopPreset={onDeleteLoopPreset}
          onLoadLoopPreset={onLoadLoopPreset}
          onLoopModeChange={onLoopModeChange}
          onLoopRangeChange={onLoopRangeChange}
          onNotice={onNotice}
          onSaveLoopPreset={onSaveLoopPreset}
          loopPresets={loopPresets}
        />
      </section>
    </section>
  )
}

const playbackSpeedSteps = [
  0.25, 0.33, 0.4, 0.5, 0.6, 0.67, 0.75, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.25, 1.33, 1.5, 1.67,
  2, 3, 4,
]

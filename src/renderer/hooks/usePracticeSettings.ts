import { useEffect, useMemo, useState } from 'react'
import type { LoopMode, LoopSettings, ProjectRecord, StoredSegment } from '../../shared/project'

type UsePracticeSettingsOptions = {
  duration: number
  segments: StoredSegment[]
}

function segmentForTime(segments: StoredSegment[], time: number, isEnd: boolean): StoredSegment {
  return (
    segments.find((segment) =>
      isEnd
        ? segment.start < time && time <= segment.end
        : segment.start <= time && time < segment.end,
    ) ?? (isEnd ? segments.at(-1) : segments[0])!
  )
}

function resolveLoopRange(
  loopSettings: LoopSettings,
  segments: StoredSegment[],
  duration: number,
): [number, number] {
  if (loopSettings.mode === 'time') return [loopSettings.startSeconds, loopSettings.endSeconds]
  if (loopSettings.mode === 'segment') {
    const start = segments.find((segment) => segment.id === loopSettings.startSegmentId)
    const end = segments.find((segment) => segment.id === loopSettings.endSegmentId)
    if (start && end) return [start.start, end.end]
  }
  return [0, duration]
}

export function usePracticeSettings({ duration, segments }: UsePracticeSettingsOptions) {
  const [masterGainDb, setMasterGainDb] = useState(0)
  const [defaultDelayBeforeMs, setDefaultDelayBeforeMs] = useState(0)
  const [defaultPrerollMs, setDefaultPrerollMs] = useState(0)
  const [defaultPostrollMs, setDefaultPostrollMs] = useState(0)
  const [loopSettings, setLoopSettings] = useState<LoopSettings>({ mode: 'none' })
  const loopRange = useMemo(
    () => resolveLoopRange(loopSettings, segments, duration),
    [duration, loopSettings, segments],
  )

  useEffect(() => {
    if (
      loopSettings.mode === 'segment' &&
      (!segments.some((segment) => segment.id === loopSettings.startSegmentId) ||
        !segments.some((segment) => segment.id === loopSettings.endSegmentId))
    ) {
      setLoopSettings({ mode: 'none' })
    }
  }, [loopSettings, segments])

  const applyProjectSettings = (project: ProjectRecord) => {
    setMasterGainDb(Math.max(-48, Math.min(24, project.masterGainDb)))
    setLoopSettings(project.loopSettings)
    setDefaultDelayBeforeMs(project.defaultDelayBeforeMs)
    setDefaultPrerollMs(project.defaultPrerollMs)
    setDefaultPostrollMs(project.defaultPostrollMs)
  }
  const setLoopMode = (mode: LoopMode) => {
    if (mode === 'none') {
      setLoopSettings({ mode: 'none' })
      return
    }
    if (mode === 'time') {
      setLoopSettings({ mode, startSeconds: loopRange[0], endSeconds: loopRange[1] })
      return
    }
    const start = segmentForTime(segments, loopRange[0], false)
    const end = segmentForTime(segments, loopRange[1], true)
    setLoopSettings({ mode, startSegmentId: start.id, endSegmentId: end.id })
  }
  const setLoopRange = ([start, end]: [number, number]) => {
    setLoopSettings((current) => {
      if (current.mode === 'segment') {
        const startSegment = segments.find((segment) => segment.start === start)
        const endSegment = segments.find((segment) => segment.end === end)
        if (startSegment && endSegment)
          return {
            mode: 'segment',
            startSegmentId: startSegment.id,
            endSegmentId: endSegment.id,
          }
      }
      return { mode: 'time', startSeconds: start, endSeconds: end }
    })
  }
  const applyLoopSettings = (nextLoopSettings: LoopSettings): boolean => {
    if (
      nextLoopSettings.mode === 'segment' &&
      (!segments.some((segment) => segment.id === nextLoopSettings.startSegmentId) ||
        !segments.some((segment) => segment.id === nextLoopSettings.endSegmentId))
    )
      return false
    setLoopSettings(nextLoopSettings)
    return true
  }
  const clearLoopForSegment = (segmentId: string) => {
    setLoopSettings((current) =>
      current.mode === 'segment' &&
      (current.startSegmentId === segmentId || current.endSegmentId === segmentId)
        ? { mode: 'none' }
        : current,
    )
  }

  return {
    applyProjectSettings,
    applyLoopSettings,
    clearLoopForSegment,
    defaultDelayBeforeMs,
    defaultPostrollMs,
    defaultPrerollMs,
    loopMode: loopSettings.mode,
    loopRange,
    loopSettings,
    masterGainDb,
    setDefaultDelayBeforeMs,
    setDefaultPostrollMs,
    setDefaultPrerollMs,
    setLoopMode,
    setLoopRange,
    setMasterGainDb,
  }
}

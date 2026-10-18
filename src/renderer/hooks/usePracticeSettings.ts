import { useState } from 'react'
import type { LoopMode, ProjectRecord } from '../../shared/project'

export function usePracticeSettings() {
  const [masterGainDb, setMasterGainDb] = useState(0)
  const [defaultDelayBeforeMs, setDefaultDelayBeforeMs] = useState(0)
  const [defaultPrerollMs, setDefaultPrerollMs] = useState(0)
  const [defaultPostrollMs, setDefaultPostrollMs] = useState(0)
  const [loopMode, setLoopMode] = useState<LoopMode>('segment')
  const [loopRange, setLoopRange] = useState<[number, number]>([18, 46])

  const applyProjectSettings = (project: ProjectRecord) => {
    setLoopRange(project.loopRange)
    setMasterGainDb(Math.max(-48, Math.min(24, project.masterGainDb)))
    setLoopMode(project.loopMode)
    setDefaultDelayBeforeMs(project.defaultDelayBeforeMs)
    setDefaultPrerollMs(project.defaultPrerollMs)
    setDefaultPostrollMs(project.defaultPostrollMs)
  }

  return {
    applyProjectSettings,
    defaultDelayBeforeMs,
    defaultPostrollMs,
    defaultPrerollMs,
    loopMode,
    loopRange,
    masterGainDb,
    setDefaultDelayBeforeMs,
    setDefaultPostrollMs,
    setDefaultPrerollMs,
    setLoopMode,
    setLoopRange,
    setMasterGainDb,
  }
}

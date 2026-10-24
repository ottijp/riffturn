import { useEffect, useState } from 'react'
import type { LoopSettings, SavedLoopPreset } from '../../shared/project'
import { deleteLoopPreset, listLoopPresets, saveLoopPreset } from '../lib/desktop'

export function useLoopPresets(projectId: string | null) {
  const [presets, setPresets] = useState<SavedLoopPreset[]>([])

  useEffect(() => {
    if (!projectId) {
      setPresets([])
      return
    }
    let cancelled = false
    void listLoopPresets(projectId)
      .then((next) => {
        if (!cancelled) setPresets(next)
      })
      .catch(() => {
        if (!cancelled) setPresets([])
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const save = async (name: string, loopSettings: LoopSettings) => {
    if (!projectId) throw new Error('No project is open.')
    const preset: SavedLoopPreset = { projectId, name, loopSettings }
    await saveLoopPreset(preset)
    setPresets((current) =>
      [...current.filter((item) => item.name !== preset.name), preset].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    )
  }

  const remove = async (name: string) => {
    if (!projectId) throw new Error('No project is open.')
    await deleteLoopPreset({ projectId, name })
    setPresets((current) => current.filter((item) => item.name !== name))
  }

  return { presets, save, remove }
}

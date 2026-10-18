import { useEffect, useRef, useState } from 'react'
import { addSampleProjects, deleteProject, listProjects, saveProject } from '../lib/desktop'
import type { ProjectRecord } from '../../shared/project'

type UseProjectLibraryOptions = {
  onInitialProject: (project: ProjectRecord) => void
  onNotice: (message: string) => void
}

export function useProjectLibrary({ onInitialProject, onNotice }: UseProjectLibraryOptions) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const initialProjectRef = useRef(onInitialProject)
  const noticeRef = useRef(onNotice)
  initialProjectRef.current = onInitialProject
  noticeRef.current = onNotice

  const refresh = async () => {
    const next = await listProjects()
    setProjects(next)
    return next
  }
  useEffect(() => {
    let cancelled = false
    void refresh()
      .then((next) => {
        if (cancelled) return
        if (next[0]) initialProjectRef.current(next[0])
        else noticeRef.current('Your library is empty. Add an audio file or sample project.')
      })
      .catch(() => noticeRef.current('Could not open saved projects.'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])
  const persist = (project: ProjectRecord) => {
    setProjects((items) => [
      project,
      ...items.filter((item) => item.projectId !== project.projectId),
    ])
    void saveProject(project).catch(() => noticeRef.current('Could not save settings.'))
  }
  const addSamples = async () => {
    const added = await addSampleProjects()
    const next = await refresh()
    return { added, projects: next }
  }
  const remove = async (projectId: string) => {
    await deleteProject(projectId)
    return refresh()
  }
  return { addSamples, loading, persist, projects, refresh, remove }
}

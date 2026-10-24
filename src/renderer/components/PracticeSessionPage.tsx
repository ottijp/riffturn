import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import type { ProjectRecord, StoredSegment } from '../../shared/project'
import { chooseAudioFile, findProjectByHash, inspectAudioFile, readAudioFile } from '../lib/desktop'
import { useAudioTransport } from '../hooks/useAudioTransport'
import { usePracticeSettings } from '../hooks/usePracticeSettings'
import { useProjectLibrary } from '../hooks/useProjectLibrary'
import { useSegmentEditor } from '../hooks/useSegmentEditor'
import { useWaveform } from '../hooks/useWaveform'
import styles from '../App.module.css'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'
import { AudioReloadPrompt } from './AudioReloadPrompt'
import { ProjectDrawer } from './ProjectDrawer'
import { TimelineWorkspace } from './TimelineWorkspace'

const initialSegments: StoredSegment[] = [
  { id: 'intro', label: 'Intro', start: 0, end: 18, speed: 0.75, gainDb: 0 },
  { id: 'verse', label: 'Verse', start: 18, end: 46, speed: 0.65, gainDb: -2 },
  { id: 'chorus', label: 'Chorus', start: 46, end: 74, speed: 0.8, gainDb: 1 },
  { id: 'outro', label: 'Outro', start: 74, end: 96, speed: 0.7, gainDb: 0 },
]

const segmentRestartThresholdSeconds = 3

export function PracticeSessionPage({ buildYear }: { buildYear: number }) {
  const [title, setTitle] = useState('Midnight Drive')
  const [duration, setDuration] = useState(96)
  const [, setNotice] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)
  const [sourcePath, setSourcePath] = useState<string | null>(null)
  const [isSample, setIsSample] = useState(false)
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false)
  const [reloadPromptOpen, setReloadPromptOpen] = useState(false)
  const [fileLoadMode, setFileLoadMode] = useState<'new' | 'existing' | 'replacement' | null>(null)
  const sourceLoadIdRef = useRef(0)
  const projectsLoadingRef = useRef(true)
  const settings = usePracticeSettings()
  const waveform = useWaveform()
  const segments = useSegmentEditor({ duration, initialSegments, onNotice: setNotice })
  const openReloadPrompt = () => {
    setNotice('Reload the audio file for this project.')
    setReloadPromptOpen(true)
  }
  const transport = useAudioTransport({
    segments: segments.segments,
    defaultDelayBeforeMs: settings.defaultDelayBeforeMs,
    defaultPostrollMs: settings.defaultPostrollMs,
    defaultPrerollMs: settings.defaultPrerollMs,
    duration,
    loopMode: settings.loopMode,
    loopRange: settings.loopRange,
    masterGainDb: settings.masterGainDb,
    onMissingSource: openReloadPrompt,
    onNotice: setNotice,
    isProjectsLoading: () => projectsLoadingRef.current,
  })
  const applyProject = (project: ProjectRecord, suppliedAudio?: File) => {
    const loadId = sourceLoadIdRef.current + 1
    sourceLoadIdRef.current = loadId
    transport.playAfterLoadRef.current = false
    transport.stop()
    setProjectId(project.projectId)
    setFileHash(project.fileHash)
    setTitle(project.title)
    setDuration(project.duration)
    setSourcePath(project.sourcePath)
    setIsSample(project.isSample)
    segments.replaceSegments(project.segments)
    settings.applyProjectSettings(project)
    transport.clearSource()
    transport.setCurrentTime(0)
    setFileLoadMode(null)
    transport.setAudioLoading(true)
    void waveform
      .load(project.fileHash)
      .catch(() => setNotice('Could not analyze the waveform. Playback is still available.'))
    void (async () => {
      try {
        const file =
          suppliedAudio ?? (await readAudioFile(project.sourcePath, project.title + '.mp3'))
        if (loadId !== sourceLoadIdRef.current) return
        transport.setSourceFile(file)
        void waveform
          .analyze(file, project.fileHash)
          .catch(() => setNotice('Could not analyze the waveform. Playback is still available.'))
      } catch {
        if (loadId !== sourceLoadIdRef.current) return
        transport.setAudioLoading(false)
        if (project.isSample)
          setNotice('Could not open the sample audio. Delete and add the sample project again.')
        else openReloadPrompt()
      }
    })()
  }
  const library = useProjectLibrary({ onInitialProject: applyProject, onNotice: setNotice })
  projectsLoadingRef.current = library.loading

  useEffect(() => {
    if (!projectId || !fileHash || !sourcePath) return
    library.persist({
      projectId,
      title,
      duration,
      fileHash,
      sourcePath,
      isSample,
      segments: segments.segments,
      loopRange: settings.loopRange,
      loopMode: settings.loopMode,
      masterGainDb: settings.masterGainDb,
      defaultDelayBeforeMs: settings.defaultDelayBeforeMs,
      defaultPrerollMs: settings.defaultPrerollMs,
      defaultPostrollMs: settings.defaultPostrollMs,
      updatedAt: Date.now(),
    })
  }, [
    projectId,
    fileHash,
    sourcePath,
    isSample,
    title,
    duration,
    segments.segments,
    settings.loopRange,
    settings.loopMode,
    settings.masterGainDb,
    settings.defaultDelayBeforeMs,
    settings.defaultPrerollMs,
    settings.defaultPostrollMs,
  ])
  useEffect(() => {
    if (!projectId || !sourcePath || !fileHash || isSample) return
    let cancelled = false
    void inspectAudioFile(sourcePath)
      .then((details) => {
        if (cancelled || details.hash === fileHash) return
        transport.stop()
        transport.clearSource()
        setNotice('The saved audio file has changed. Relink it to continue.')
        setReloadPromptOpen(true)
      })
      .catch(() => {
        if (cancelled) return
        transport.stop()
        transport.clearSource()
        setNotice('The saved audio file could not be found. Relink it if it has been moved.')
        setReloadPromptOpen(true)
      })
    return () => {
      cancelled = true
    }
  }, [projectId, sourcePath, fileHash, isSample])

  const selectAudioFile = async (isNewProject: boolean) => {
    try {
      const path = await chooseAudioFile()
      if (!path) return
      setNotice('Checking audio file…')
      const details = await inspectAudioFile(path)
      const file = await readAudioFile(path, details.name)
      const matching = await findProjectByHash(details.hash)
      if (matching) {
        applyProject({ ...matching, sourcePath: path, isSample: false }, file)
        transport.playAfterLoadRef.current = true
        setFileLoadMode('existing')
        setNotice('Restored saved segment settings.')
        return
      }
      if (
        !isNewProject &&
        projectId &&
        fileHash &&
        fileHash !== details.hash &&
        !window.confirm(
          'This differs from the saved audio file. Apply the current segment settings to this file? The original hash will be updated.',
        )
      ) {
        setNotice('Cancelled loading a different audio file.')
        return
      }
      setFileHash(details.hash)
      setSourcePath(path)
      setIsSample(false)
      setTitle(details.name.replace(/\.[^/.]+$/, ''))
      if (isNewProject) setProjectId(null)
      transport.playAfterLoadRef.current = true
      sourceLoadIdRef.current += 1
      transport.stop()
      transport.setSourceFile(file)
      transport.setAudioLoading(true)
      setFileLoadMode(isNewProject || !projectId ? 'new' : 'replacement')
      setNotice(isNewProject ? 'Loaded audio as a new project.' : 'Loaded audio.')
      void waveform
        .analyze(file, details.hash)
        .catch(() => setNotice('Could not analyze the waveform. Playback is still available.'))
    } catch {
      setNotice('Could not open the audio file. Check that the file is accessible.')
    }
  }
  const onLoadedMetadata = (event: SyntheticEvent<HTMLAudioElement>) => {
    const trackDuration = Math.min(event.currentTarget.duration, 1800)
    if (fileLoadMode !== 'new') {
      setDuration(trackDuration)
      setFileLoadMode(null)
      return
    }
    const first: StoredSegment = {
      id: 'segment-' + Date.now(),
      label: 'Segment 1',
      start: 0,
      end: trackDuration,
      speed: 1,
      gainDb: 0,
    }
    setDuration(trackDuration)
    segments.replaceSegments([first])
    settings.setLoopRange([0, trackDuration])
    transport.setCurrentTime(0)
    setProjectId(crypto.randomUUID())
    setFileLoadMode(null)
  }
  const clearCurrentProject = () => {
    sourceLoadIdRef.current += 1
    transport.stop()
    transport.clearSource()
    setProjectId(null)
    setFileHash(null)
    setSourcePath(null)
    setIsSample(false)
    transport.setAudioLoading(false)
    waveform.clear()
    setFileLoadMode(null)
  }
  const removeProject = async (project: ProjectRecord) => {
    const sourceNotice = project.isSample
      ? 'The sample audio file will also be deleted.'
      : 'The original audio file will not be deleted.'
    if (!window.confirm(`Delete “${project.title}”? ${sourceNotice}`)) return
    try {
      const next = await library.remove(project.projectId)
      if (project.projectId === projectId) {
        if (next[0]) applyProject(next[0])
        else clearCurrentProject()
      }
      setNotice('Deleted project.')
    } catch {
      setNotice('Could not delete project.')
    }
  }
  const addSamples = async () => {
    try {
      const { added } = await library.addSamples()
      if (!projectId && added[0]) applyProject(added[0])
      setNotice(
        added.length > 0 ? 'Added sample projects.' : 'No sample projects are available to add.',
      )
    } catch {
      setNotice('Could not add sample projects.')
    }
  }
  const moveSegment = (offset: -1 | 1) => {
    const activeIndex = segments.segments.findIndex(
      (segment) => segment.id === transport.activeSegment.id,
    )
    // Account for playback speed so the configured real-time duration restarts the current segment.
    if (offset === -1) {
      const elapsedInSegment = transport.currentTime - transport.activeSegment.start
      const restartThreshold = transport.activeSegment.speed * segmentRestartThresholdSeconds
      if (activeIndex === 0 || restartThreshold <= elapsedInSegment) {
        transport.seek(transport.activeSegment.start)
        return
      }
    }
    const target = segments.segments[activeIndex + offset]
    if (!target) return
    segments.selectSegment(target)
    transport.seek(target.start)
  }
  const setSingleSegmentLoop = (segment: StoredSegment) => {
    const isTarget =
      settings.loopMode === 'segment' &&
      settings.loopRange[0] === segment.start &&
      settings.loopRange[1] === segment.end
    if (isTarget) {
      settings.setLoopMode('none')
      setNotice('Loop disabled.')
      return
    }
    segments.selectSegment(segment)
    settings.setLoopMode('segment')
    settings.setLoopRange([segment.start, segment.end])
    setNotice(`Set “${segment.label}” as the loop range.`)
    transport.startPractice(segment.start)
  }
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target instanceof Element ? event.target : null
      const isEditing = Boolean(
        target?.closest('input:not([type="range"]), textarea, select, [contenteditable="true"]'),
      )
      const isRange = Boolean(target?.closest('input[type="range"]'))
      const isButton = Boolean(target?.closest('button, a'))
      if (event.code === 'Space') {
        if (event.repeat || isEditing || isRange || isButton) return
        event.preventDefault()
        void transport.togglePlayback()
        return
      }
      if (event.code === 'KeyL') {
        if (event.repeat || isEditing || settings.loopMode === 'none') return
        event.preventDefault()
        transport.startPractice(settings.loopRange[0])
        return
      }
      if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') return
      if (isEditing || isRange || isButton) return
      event.preventDefault()
      if (event.shiftKey)
        transport.seek(transport.currentTime + (event.code === 'ArrowLeft' ? -10 : 10))
      else moveSegment(event.code === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [settings.loopMode, settings.loopRange, transport.currentTime, transport.togglePlayback])
  const loopVisualRange: [number, number] = [
    Math.max(0, settings.loopRange[0]),
    Math.min(duration, settings.loopRange[1]),
  ]
  const prerollStart = Math.max(0, loopVisualRange[0] - settings.defaultPrerollMs / 1000)
  const postrollEnd = Math.min(duration, loopVisualRange[1] + settings.defaultPostrollMs / 1000)

  return (
    <main className={styles.app}>
      <AppHeader
        onOpenProjectDrawer={() => setProjectDrawerOpen(true)}
        onTitleChange={setTitle}
        title={title}
      />
      <AudioReloadPrompt
        isOpen={reloadPromptOpen}
        onClose={() => setReloadPromptOpen(false)}
        onSelectAudio={() => {
          setReloadPromptOpen(false)
          void selectAudioFile(false)
        }}
      />
      <ProjectDrawer
        currentProjectId={projectId}
        isOpen={projectDrawerOpen}
        onAddAudio={() => void selectAudioFile(true)}
        onAddSamples={() => void addSamples()}
        onClose={() => setProjectDrawerOpen(false)}
        onRemoveProject={(project) => void removeProject(project)}
        onSelectProject={(project) => {
          applyProject(project)
          setProjectDrawerOpen(false)
          setNotice(project.isSample ? 'Opened sample project.' : 'Opened local audio.')
        }}
        projects={library.projects}
      />
      <TimelineWorkspace
        activeSegment={transport.activeSegment}
        audioLoading={transport.audioLoading}
        canvasRef={waveform.canvasRef}
        currentTime={transport.currentTime}
        defaultDelayBeforeMs={settings.defaultDelayBeforeMs}
        defaultPostrollMs={settings.defaultPostrollMs}
        defaultPrerollMs={settings.defaultPrerollMs}
        duration={duration}
        loopMode={settings.loopMode}
        loopRange={settings.loopRange}
        masterGainDb={settings.masterGainDb}
        onAddSegment={() => segments.addSegment(transport.currentTime)}
        onCloseSegmentSettings={() => segments.setSettingsOpen(false)}
        onDefaultDelayBeforeChange={settings.setDefaultDelayBeforeMs}
        onDefaultPostrollChange={settings.setDefaultPostrollMs}
        onDefaultPrerollChange={settings.setDefaultPrerollMs}
        onDeleteSegment={segments.deleteSelected}
        onLoopModeChange={settings.setLoopMode}
        onLoopRangeChange={settings.setLoopRange}
        onMasterGainChange={settings.setMasterGainDb}
        onMoveSegment={moveSegment}
        onNotice={setNotice}
        onOpenSegmentSettings={segments.openSettings}
        onSeek={(time) => transport.seek(time)}
        onSegmentGainChange={(value) => segments.updateSelected('gainDb', value)}
        onSegmentNameChange={(value) => segments.updateSelected('label', value)}
        onSegmentSpeedChange={(value) => segments.updateSelected('speed', value)}
        onSelectTimelineSegment={(segment) => {
          settings.setLoopMode('none')
          transport.seek(segment.start)
        }}
        onSetSingleSegmentLoop={setSingleSegmentLoop}
        onStartPractice={() => transport.startPractice(settings.loopRange[0])}
        onTogglePlayback={transport.togglePlayback}
        playing={transport.playing}
        postrollEnd={postrollEnd}
        prerollStart={prerollStart}
        projectsLoading={library.loading}
        segmentCount={segments.segments.length}
        segmentSettingsOpen={segments.settingsOpen}
        segments={segments.segments}
        selectedIndex={segments.segments.findIndex(
          (segment) => segment.id === transport.activeSegment.id,
        )}
        selectedSegment={segments.selectedSegment}
        visualLoopRange={loopVisualRange}
      />
      <audio
        {...transport.audioProps}
        onError={() => {
          transport.playAfterLoadRef.current = false
          transport.setAudioLoading(false)
          if (sourcePath) {
            transport.clearSource()
            openReloadPrompt()
          } else setNotice(isSample ? 'Could not load sample audio.' : 'Could not load audio.')
        }}
        onLoadedMetadata={onLoadedMetadata}
      />
      <AppFooter buildYear={buildYear} />
    </main>
  )
}

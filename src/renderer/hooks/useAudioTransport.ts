import { useEffect, useMemo, useRef, useState } from 'react'
import type { LoopMode, StoredSegment } from '../../shared/project'

type UseAudioTransportOptions = {
  segments: StoredSegment[]
  defaultDelayBeforeMs: number
  defaultPostrollMs: number
  defaultPrerollMs: number
  duration: number
  loopMode: LoopMode
  loopRange: [number, number]
  masterGainDb: number
  onMissingSource: () => void
  onNotice: (message: string) => void
  isProjectsLoading: () => boolean
}

export function useAudioTransport({
  segments,
  defaultDelayBeforeMs,
  defaultPostrollMs,
  defaultPrerollMs,
  duration,
  loopMode,
  loopRange,
  masterGainDb,
  onMissingSource,
  onNotice,
  isProjectsLoading,
}: UseAudioTransportOptions) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<number | null>(null)
  const sourceUrlRef = useRef<string | null>(null)
  const playAfterLoadRef = useRef(false)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const activeSegment = useMemo(
    () =>
      segments.find((segment) => currentTime >= segment.start && currentTime < segment.end) ??
      segments.at(-1)!,
    [currentTime, segments],
  )

  const clearSource = () => {
    const previous = sourceUrlRef.current
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous)
    sourceUrlRef.current = null
    setSourceUrl(null)
  }
  const setSourceFile = (file: File) => {
    clearSource()
    const url = URL.createObjectURL(file)
    sourceUrlRef.current = url
    setSourceUrl(url)
  }
  const stop = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    audioRef.current?.pause()
    setPlaying(false)
  }
  const seek = (time: number) => {
    const target = Math.max(0, Math.min(duration, time))
    if (audioRef.current) audioRef.current.currentTime = target
    setCurrentTime(target)
  }
  const startPractice = (startAt: number) => {
    const audio = audioRef.current
    if (isProjectsLoading() || audioLoading) {
      onNotice(isProjectsLoading() ? 'Preparing projects…' : 'Loading audio…')
      return
    }
    if (!audio || !sourceUrl) {
      onMissingSource()
      return
    }
    stop()
    seek(Math.max(0, startAt - defaultPrerollMs / 1000))
    const play = () => {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => onNotice('Could not start playback. Try the play button again.'))
    }
    if (defaultDelayBeforeMs === 0) {
      play()
      return
    }
    void audio
      .play()
      .then(() => {
        audio.pause()
        timerRef.current = window.setTimeout(play, defaultDelayBeforeMs)
      })
      .catch(() => onNotice('Could not start playback. Try the play button again.'))
  }
  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isProjectsLoading() || audioLoading) {
      onNotice(isProjectsLoading() ? 'Preparing projects…' : 'Loading audio…')
      return
    }
    if (!sourceUrl) {
      onMissingSource()
      return
    }
    if (audio.paused) {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        onNotice('Could not start playback. Try the play button again.')
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = activeSegment.speed
    audio.preservesPitch = true
    audio.volume = Math.min(1, Math.pow(10, (activeSegment.gainDb + masterGainDb) / 20))
  }, [activeSegment, masterGainDb])
  useEffect(
    () => () => {
      stop()
      const current = sourceUrlRef.current
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
    },
    [],
  )

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    if (
      loopMode !== 'none' &&
      audio.currentTime >= Math.min(duration, loopRange[1] + defaultPostrollMs / 1000)
    ) {
      startPractice(loopRange[0])
      return
    }
    setCurrentTime(audio.currentTime)
  }
  const onCanPlay = () => {
    setAudioLoading(false)
    if (!playAfterLoadRef.current) return
    playAfterLoadRef.current = false
    const audio = audioRef.current
    if (!audio) return
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => onNotice('Could not start autoplay. Press the play button.'))
  }
  const audioProps = {
    ref: audioRef,
    src: sourceUrl ?? undefined,
    onLoadStart: () => setAudioLoading(true),
    onCanPlay,
    onTimeUpdate,
    onEnded: () => {
      if (loopMode !== 'none') startPractice(loopRange[0])
      else setPlaying(false)
    },
  }
  return {
    activeSegment,
    audioLoading,
    audioProps,
    clearSource,
    currentTime,
    playAfterLoadRef,
    playing,
    seek,
    setAudioLoading,
    setCurrentTime,
    setSourceFile,
    sourceUrl,
    startPractice,
    stop,
    togglePlayback,
  }
}

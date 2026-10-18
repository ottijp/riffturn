import { useMemo, useState } from 'react'
import type { StoredSegment } from '../../shared/project'

type UseSegmentEditorOptions = {
  duration: number
  initialSegments: StoredSegment[]
  onNotice: (message: string) => void
}

export function useSegmentEditor({ duration, initialSegments, onNotice }: UseSegmentEditorOptions) {
  const [segments, setSegments] = useState(initialSegments)
  const [selectedId, setSelectedId] = useState(initialSegments[0]?.id ?? '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedId) ?? segments[0],
    [segments, selectedId],
  )

  const replaceSegments = (next: StoredSegment[]) => {
    setSegments(next)
    setSelectedId(next[0]?.id ?? '')
    setSettingsOpen(false)
  }
  const selectSegment = (segment: StoredSegment) => setSelectedId(segment.id)
  const openSettings = (segment: StoredSegment) => {
    selectSegment(segment)
    setSettingsOpen(true)
  }
  const updateSelected = (key: keyof StoredSegment, value: string | number) => {
    if (!selectedSegment) return
    setSegments((items) =>
      items.map((item) => (item.id === selectedSegment.id ? { ...item, [key]: value } : item)),
    )
  }
  const addSegment = (currentTime: number) => {
    const minimumLength = 1
    const splitAt = Math.max(0, Math.min(duration, currentTime))
    const target = segments.find(
      (segment, index) =>
        splitAt >= segment.start &&
        (splitAt < segment.end || (index === segments.length - 1 && splitAt <= segment.end)),
    )
    if (
      !target ||
      splitAt <= target.start + minimumLength ||
      splitAt >= target.end - minimumLength
    ) {
      onNotice('The playback position is too close to the segment edge. Add it within the segment.')
      return
    }
    const index = segments.findIndex((segment) => segment.id === target.id)
    const nextSegment: StoredSegment = {
      ...target,
      id: 'segment-' + Date.now(),
      label: 'Segment ' + (segments.length + 1),
      start: splitAt,
    }
    const next = [...segments]
    next[index] = { ...target, end: splitAt }
    next.splice(index + 1, 0, nextSegment)
    setSegments(next)
    setSelectedId(nextSegment.id)
    onNotice(`Added “${nextSegment.label}” by splitting the segment at the playback position.`)
  }
  const deleteSelected = () => {
    if (!selectedSegment) return
    const index = segments.findIndex((segment) => segment.id === selectedSegment.id)
    if (segments.length === 1) {
      onNotice(
        'The last segment cannot be deleted. At least one segment must cover the whole track.',
      )
      return
    }
    if (
      !window.confirm(
        `Delete “${selectedSegment.label}”? Its time range will be merged into the adjacent segment.`,
      )
    )
      return
    const next = [...segments]
    const replacementIndex = index > 0 ? index - 1 : 1
    const replacement = next[replacementIndex]
    next[replacementIndex] =
      index > 0
        ? { ...replacement, end: selectedSegment.end }
        : { ...replacement, start: selectedSegment.start }
    next.splice(index, 1)
    setSegments(next)
    setSelectedId(next[index > 0 ? index - 1 : 0].id)
    setSettingsOpen(false)
    onNotice(
      `Deleted “${selectedSegment.label}” and merged its time range into the adjacent segment.`,
    )
  }

  return {
    addSegment,
    deleteSelected,
    openSettings,
    replaceSegments,
    selectedIndex: selectedSegment
      ? segments.findIndex((segment) => segment.id === selectedSegment.id)
      : -1,
    selectedSegment,
    selectSegment,
    segments,
    settingsOpen,
    setSettingsOpen,
    updateSelected,
  }
}

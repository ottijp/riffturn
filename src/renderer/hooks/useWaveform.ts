import { useEffect, useRef, useState } from 'react'
import { loadWaveform, saveWaveform } from '../lib/desktop'

async function createPeaks(file: File): Promise<number[]> {
  const context = new AudioContext()
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer())
    const peakCount = Math.min(2048, Math.max(320, Math.ceil(buffer.duration * 40)))
    const framesPerPeak = Math.max(1, Math.floor(buffer.length / peakCount))
    const peaks = Array.from({ length: peakCount }, (_, peakIndex) => {
      const start = peakIndex * framesPerPeak
      const end = Math.min(buffer.length, start + framesPerPeak)
      let peak = 0
      for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
        const samples = buffer.getChannelData(channel)
        for (let frame = start; frame < end; frame += 32)
          peak = Math.max(peak, Math.abs(samples[frame] ?? 0))
      }
      return peak
    })
    const maximum = Math.max(...peaks, 0.01)
    return peaks.map((peak) => Math.sqrt(peak / maximum))
  } finally {
    await context.close()
  }
}

export function useWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [peaks, setPeaks] = useState<number[]>([])

  const load = async (fileHash: string) => {
    const waveform = await loadWaveform(fileHash)
    setPeaks(waveform?.peaks ?? [])
  }

  const analyze = async (file: File, fileHash: string) => {
    const saved = await loadWaveform(fileHash)
    if (saved) {
      setPeaks(saved.peaks)
      return
    }
    setPeaks([])
    const nextPeaks = await createPeaks(file)
    setPeaks(nextPeaks)
    await saveWaveform({ fileHash, peaks: nextPeaks })
  }

  const clear = () => setPeaks([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || peaks.length === 0) return
    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio))
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio))
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, bounds.width, bounds.height)
      context.fillStyle = getComputedStyle(canvas).getPropertyValue('--color-wave')
      const middle = bounds.height / 2
      const step = bounds.width / peaks.length
      peaks.forEach((peak, index) => {
        const amplitude = Math.max(2, peak * middle * 0.9)
        context.fillRect(index * step, middle - amplitude, Math.max(1, step - 1), amplitude * 2)
      })
    }
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    draw()
    return () => observer.disconnect()
  }, [peaks])

  return { analyze, canvasRef, clear, load }
}

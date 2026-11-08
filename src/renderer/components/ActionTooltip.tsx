import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ActionTooltip.module.css'

type TooltipState = { text: string; x: number; y: number; below: boolean }

export function ActionTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    let timer: number | undefined
    let target: HTMLElement | null = null
    let pointer: { x: number; y: number } | null = null

    const position = (x: number, y: number) => {
      const halfWidth = Math.min(144, (window.innerWidth - 16) / 2)
      const below = y < 70
      return {
        x: Math.max(halfWidth + 8, Math.min(window.innerWidth - halfWidth - 8, x)),
        y: below ? y + 16 : y - 12,
        below,
      }
    }

    const hide = () => {
      window.clearTimeout(timer)
      target = null
      pointer = null
      setTooltip(null)
    }
    const show = (element: HTMLElement, event: MouseEvent | FocusEvent) => {
      if (target === element) return
      hide()
      target = element
      if (event instanceof MouseEvent) pointer = { x: event.clientX, y: event.clientY }
      timer = window.setTimeout(
        () => {
          if (!element.isConnected) return
          const text = element.dataset.tooltip
          if (!text) return
          const rect = element.getBoundingClientRect()
          setTooltip({
            text,
            ...position(pointer?.x ?? rect.left + rect.width / 2, pointer?.y ?? rect.top),
          })
        },
        event instanceof MouseEvent ? 200 : 0,
      )
    }
    const enter = (event: Event) => {
      if (!(event instanceof MouseEvent || event instanceof FocusEvent)) return
      if (!(event.target instanceof Element)) return
      const element = event.target.closest<HTMLElement>('[data-tooltip]')
      if (element) show(element, event)
    }
    const move = (event: MouseEvent) => {
      if (!target || !(event.target instanceof Node) || !target.contains(event.target)) return
      pointer = { x: event.clientX, y: event.clientY }
      setTooltip((current) =>
        current ? { ...current, ...position(event.clientX, event.clientY) } : null,
      )
    }
    const leave = (event: Event) => {
      if (!(event instanceof MouseEvent || event instanceof FocusEvent)) return
      if (target && event.relatedTarget instanceof Node && target.contains(event.relatedTarget))
        return
      hide()
    }
    window.addEventListener('mouseover', enter)
    window.addEventListener('mousemove', move)
    window.addEventListener('focusin', enter)
    window.addEventListener('mouseout', leave)
    window.addEventListener('focusout', leave)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      hide()
      window.removeEventListener('mouseover', enter)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('focusin', enter)
      window.removeEventListener('mouseout', leave)
      window.removeEventListener('focusout', leave)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [])

  if (!tooltip) return null
  return createPortal(
    <span
      className={styles.tooltip}
      role="tooltip"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: tooltip.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      {tooltip.text}
    </span>,
    document.body,
  )
}

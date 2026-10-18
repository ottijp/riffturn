import { Info } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './HelpTooltip.module.css'

type HelpTooltipProps = {
  children: ReactNode
  label: string
}

export function HelpTooltip({ children, label }: HelpTooltipProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target))
        setIsOpen(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [isOpen])

  return (
    <span ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.button}
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <Info aria-hidden="true" />
      </button>
      {isOpen && (
        <span className={styles.tooltip} role="tooltip">
          {children}
        </span>
      )}
    </span>
  )
}

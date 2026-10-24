import { Info } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './HelpTooltip.module.css'
import { IconButton } from './Button'

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
      <IconButton
        aria-label={label}
        aria-expanded={isOpen}
        active={isOpen}
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Info aria-hidden="true" />
      </IconButton>
      {isOpen && (
        <span className={styles.tooltip} role="tooltip">
          {children}
        </span>
      )}
    </span>
  )
}

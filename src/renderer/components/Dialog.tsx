import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './Dialog.module.css'
import { BackdropButton, IconButton } from './Button'

type DialogProps = {
  children: ReactNode
  closeLabel: string
  eyebrow?: string
  onClose: () => void
  size?: 'standard' | 'wide'
  title: ReactNode
  titleId: string
}

export function Dialog({
  children,
  closeLabel,
  eyebrow,
  onClose,
  size = 'standard',
  title,
  titleId,
}: DialogProps) {
  return (
    <>
      <BackdropButton className={styles.backdrop} aria-label={closeLabel} onClick={onClose} />
      <section
        className={`${styles.dialog} ${size === 'wide' ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.heading}>
          <div>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <IconButton className={styles.closeButton} aria-label={closeLabel} variant="ghost" onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        </div>
        {children}
      </section>
    </>
  )
}

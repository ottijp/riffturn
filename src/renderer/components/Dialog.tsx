import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { classNames } from '../lib/class-names'
import styles from './Dialog.module.css'
import { BackdropButton, IconButton } from './Button'

type DialogBaseProps = {
  children: ReactNode
  closeLabel: string
  onClose: () => void
  size?: 'narrow' | 'standard' | 'wide'
  titleId: string
}

type DialogProps =
  | (DialogBaseProps & {
      eyebrow?: string
      header?: never
      title: ReactNode
    })
  | (DialogBaseProps & {
      eyebrow?: never
      header: ReactNode
      title?: never
    })

export function Dialog({
  children,
  closeLabel,
  eyebrow,
  header,
  onClose,
  size = 'standard',
  title,
  titleId,
}: DialogProps) {
  return (
    <>
      <BackdropButton className={styles.backdrop} aria-label={closeLabel} onClick={onClose} />
      <section
        className={classNames(
          styles.dialog,
          size === 'wide' && styles.wide,
          size === 'narrow' && styles.narrow,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.heading}>
          {header ?? (
            <div>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              <h2 id={titleId}>{title}</h2>
            </div>
          )}
          <IconButton
            className={styles.closeButton}
            aria-label={closeLabel}
            variant="ghost"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </IconButton>
        </div>
        {children}
      </section>
    </>
  )
}

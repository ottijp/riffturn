import styles from './AudioReloadPrompt.module.css'
import { BackdropButton, Button } from './Button'

type AudioReloadPromptProps = {
  isOpen: boolean
  onClose: () => void
  onSelectAudio: () => void
}

export function AudioReloadPrompt({ isOpen, onClose, onSelectAudio }: AudioReloadPromptProps) {
  if (!isOpen) return null

  return (
    <>
      <BackdropButton
        className={styles.backdrop}
        aria-label="Close audio reload prompt"
        onClick={onClose}
      />
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-reload-title"
      >
        <p className={styles.eyebrow}>AUDIO FILE REQUIRED</p>
        <h2 id="audio-reload-title">Relink your audio file</h2>
        <p>
          The saved audio file could not be found or opened. Select the file if it has been moved.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onSelectAudio}>
            Select audio file
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
        </div>
      </section>
    </>
  )
}

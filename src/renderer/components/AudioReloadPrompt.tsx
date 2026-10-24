import styles from './AudioReloadPrompt.module.css'
import { Button } from './Button'
import { Dialog } from './Dialog'

type AudioReloadPromptProps = {
  isOpen: boolean
  onClose: () => void
  onSelectAudio: () => void
}

export function AudioReloadPrompt({ isOpen, onClose, onSelectAudio }: AudioReloadPromptProps) {
  if (!isOpen) return null

  return (
    <Dialog
      closeLabel="Close audio reload prompt"
      eyebrow="AUDIO FILE REQUIRED"
      onClose={onClose}
      title="Relink your audio file"
      titleId="audio-reload-title"
    >
      <p className={styles.description}>
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
    </Dialog>
  )
}

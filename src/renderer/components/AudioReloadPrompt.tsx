import styles from './AudioReloadPrompt.module.css'

type AudioReloadPromptProps = {
  isOpen: boolean
  onClose: () => void
  onSelectAudio: () => void
}

export function AudioReloadPrompt({ isOpen, onClose, onSelectAudio }: AudioReloadPromptProps) {
  if (!isOpen) return null

  return (
    <>
      <button
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
          <button className={styles.confirmButton} onClick={onSelectAudio}>
            Select audio file
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Not now
          </button>
        </div>
      </section>
    </>
  )
}

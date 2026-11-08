import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { SavedLoopPreset } from '../../shared/project'
import { Button, IconButton } from './Button'
import { Dialog } from './Dialog'
import styles from './LoadLoopPresetDialog.module.css'

type LoadLoopPresetDialogProps = {
  onClose: () => void
  onDelete: (name: string) => Promise<void>
  onLoad: (preset: SavedLoopPreset) => void
  presets: SavedLoopPreset[]
}

export function LoadLoopPresetDialog({
  onClose,
  onDelete,
  onLoad,
  presets,
}: LoadLoopPresetDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const deletePreset = async (name: string) => {
    if (!window.confirm(`Delete “${name}”?`)) return
    setDeleting(true)
    setError('')
    try {
      await onDelete(name)
    } catch {
      setError('Could not delete this loop setting.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      closeLabel="Close loop settings dialog"
      eyebrow="LOOP SETTINGS"
      title="Load loop setting"
      titleId="load-loop-preset-title"
      onClose={onClose}
    >
      <div className={styles.content}>
        {presets.length === 0 ? (
          <p className={styles.empty}>No saved loop settings.</p>
        ) : (
          <ul className={styles.list}>
            {presets.map((preset) => (
              <li key={preset.name} className={styles.row}>
                <Button
                  className={styles.loadButton}
                  variant="ghost"
                  onClick={() => {
                    onLoad(preset)
                    onClose()
                  }}
                >
                  {preset.name}
                </Button>
                <IconButton
                  aria-label={`Delete ${preset.name}`}
                  title={`Delete ${preset.name}`}
                  disabled={deleting}
                  variant="danger"
                  onClick={() => void deletePreset(preset.name)}
                >
                  <Trash2 aria-hidden="true" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}

import { useState, type FormEvent } from 'react'
import { Dialog } from './Dialog'
import styles from './LoopPresetDialog.module.css'
import { Button } from './Button'

type LoopPresetDialogProps = {
  onClose: () => void
  onSave: (name: string) => Promise<void>
}

export function LoopPresetDialog({ onClose, onSave }: LoopPresetDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextName = name.trim()
    if (!nextName) {
      setError('Enter a name for this loop setting.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(nextName)
      onClose()
    } catch {
      setError('Could not save this loop setting.')
      setSaving(false)
    }
  }

  return (
    <Dialog
      closeLabel="Close loop settings dialog"
      eyebrow="LOOP SETTINGS"
      title="Save loop setting"
      titleId="loop-preset-title"
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={(event) => void submit(event)}>
        <label>
          Name
          <input
            autoFocus
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} loading={saving} type="submit" variant="primary">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

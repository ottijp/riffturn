import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import styles from './EditableName.module.css'
import { IconButton } from './Button'

type EditableNameProps = {
  ariaLabel: string
  className?: string
  heading: 'h1' | 'h2'
  headingId?: string
  onCommit: (value: string) => void
  value: string
}

export function EditableName({
  ariaLabel,
  className,
  heading: Heading,
  headingId,
  onCommit,
  value,
}: EditableNameProps) {
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)
  const begin = () => {
    setDraft(value)
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const commit = () => {
    const next = draft.trim()
    if (next) onCommit(next)
    setEditing(false)
  }
  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      {editing ? (
        <>
          <input
            autoFocus
            aria-label={ariaLabel}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={cancel}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit()
              if (event.key === 'Escape') cancel()
            }}
          />
          <IconButton
            aria-label={`Save ${ariaLabel}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={commit}
          >
            <Check aria-hidden="true" />
          </IconButton>
          <IconButton
            aria-label={`Cancel editing ${ariaLabel}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={cancel}
          >
            <X aria-hidden="true" />
          </IconButton>
        </>
      ) : (
        <>
          <Heading id={headingId}>{value}</Heading>
          <IconButton aria-label={`Edit ${ariaLabel}`} onClick={begin}>
            <Pencil aria-hidden="true" />
          </IconButton>
        </>
      )}
    </div>
  )
}

import type { LoopMode } from '../../shared/project'
import styles from './LoopModeSelector.module.css'

export function LoopModeSelector({
  mode,
  onChange,
}: {
  mode: LoopMode
  onChange: (mode: LoopMode) => void
}) {
  return (
    <div className={styles.controls} role="group" aria-label="Loop mode">
      {(
        [
          ['none', 'None'],
          ['segment', 'Segment'],
          ['time', 'Time'],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={mode === value ? styles.selected : ''}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

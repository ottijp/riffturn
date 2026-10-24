import type { LoopMode } from '../../shared/project'
import styles from './LoopModeSelector.module.css'
import { Button } from './Button'

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
        <Button
          key={value}
          active={mode === value}
          className={mode === value ? styles.selected : undefined}
          aria-pressed={mode === value}
          size="sm"
          variant="ghost"
          onClick={() => onChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

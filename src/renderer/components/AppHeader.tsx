import { PanelLeftOpen } from 'lucide-react'
import styles from './AppHeader.module.css'
import { EditableName } from './EditableName'

type AppHeaderProps = {
  onOpenProjectDrawer: () => void
  onTitleChange: (title: string) => void
  title: string
}

export function AppHeader({ onOpenProjectDrawer, onTitleChange, title }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerActions}>
        <button
          className={styles.projectButton}
          aria-label="Open projects"
          title="Open projects"
          onClick={onOpenProjectDrawer}
        >
          <PanelLeftOpen aria-hidden="true" />
        </button>
      </div>
      <EditableName ariaLabel="Project name" heading="h1" value={title} onCommit={onTitleChange} />
    </header>
  )
}

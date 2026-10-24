import { Info, PanelLeftOpen } from 'lucide-react'
import styles from './AppHeader.module.css'
import { EditableName } from './EditableName'

type AppHeaderProps = {
  onOpenProjectDrawer: () => void
  onShowProjectInfo: () => void
  onTitleChange: (title: string) => void
  projectInfoAvailable: boolean
  title: string
}

export function AppHeader({
  onOpenProjectDrawer,
  onShowProjectInfo,
  onTitleChange,
  projectInfoAvailable,
  title,
}: AppHeaderProps) {
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
      <div className={styles.titleActions}>
        <EditableName
          ariaLabel="Project name"
          heading="h1"
          value={title}
          onCommit={onTitleChange}
        />
        <button
          className={styles.projectInfoButton}
          aria-label="Show project information"
          title="Show project information"
          disabled={!projectInfoAvailable}
          onClick={onShowProjectInfo}
        >
          <Info aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

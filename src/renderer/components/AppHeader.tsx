import { Info, PanelLeftOpen } from 'lucide-react'
import styles from './AppHeader.module.css'
import { IconButton } from './Button'
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
        <IconButton
          className={styles.projectButton}
          aria-label="Open projects"
          title="Open projects"
          size="lg"
          variant="ghost"
          onClick={onOpenProjectDrawer}
        >
          <PanelLeftOpen aria-hidden="true" />
        </IconButton>
      </div>
      <div className={styles.titleActions}>
        <EditableName
          ariaLabel="Project name"
          heading="h1"
          value={title}
          onCommit={onTitleChange}
        />
        <IconButton
          className={styles.projectInfoButton}
          aria-label="Show project information"
          title="Show project information"
          disabled={!projectInfoAvailable}
          variant="secondary"
          onClick={onShowProjectInfo}
        >
          <Info aria-hidden="true" />
        </IconButton>
      </div>
    </header>
  )
}

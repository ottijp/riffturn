import type { ProjectRecord } from '../../shared/project'
import { Dialog } from './Dialog'
import styles from './ProjectInfoDialog.module.css'

type ProjectInfoDialogProps = {
  onClose: () => void
  project: ProjectRecord | null
}

export function ProjectInfoDialog({ onClose, project }: ProjectInfoDialogProps) {
  if (!project) return null
  const updatedAt = new Date(project.updatedAt)
  const updatedAtLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(updatedAt)

  return (
    <Dialog
      closeLabel="Close project information"
      eyebrow="PROJECT INFORMATION"
      onClose={onClose}
      size="wide"
      title={project.title}
      titleId="project-information-title"
    >
      <div className={styles.path}>
        <p>FILE PATH</p>
        <code>{project.sourcePath}</code>
      </div>
      <div className={styles.updatedAt}>
        <p>LAST UPDATED</p>
        <time dateTime={updatedAt.toISOString()}>{updatedAtLabel}</time>
      </div>
    </Dialog>
  )
}

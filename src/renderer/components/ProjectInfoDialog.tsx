import type { ProjectRecord } from '../../shared/project'
import { useEffect, useState } from 'react'
import { Dialog } from './Dialog'
import styles from './ProjectInfoDialog.module.css'

type ProjectInfoDialogProps = {
  onClose: () => void
  onSaveDescription: (description: string) => void
  project: ProjectRecord | null
}

export function ProjectInfoDialog({ onClose, onSaveDescription, project }: ProjectInfoDialogProps) {
  const [description, setDescription] = useState('')
  useEffect(() => {
    if (project) setDescription(project.description)
  }, [project])
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
      <div className={styles.description}>
        <label htmlFor="project-description">DESCRIPTION</label>
        {project.isSample ? (
          <p>{project.description || 'No description.'}</p>
        ) : (
          <>
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <button
              type="button"
              disabled={description === project.description}
              onClick={() => onSaveDescription(description)}
            >
              Save description
            </button>
          </>
        )}
      </div>
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

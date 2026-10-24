import { Info, Music, Plus, Trash2, X } from 'lucide-react'
import type { ProjectSummary } from '../../shared/project'
import { formatDuration } from '../lib/format'
import styles from './ProjectDrawer.module.css'
import { BackdropButton, Button, IconButton } from './Button'

type ProjectDrawerProps = {
  currentProjectId: string | null
  isOpen: boolean
  onAddAudio: () => void
  onAddSamples: () => void
  onClose: () => void
  onRemoveProject: (project: ProjectSummary) => void
  onSelectProject: (project: ProjectSummary) => void
  onShowProjectInfo: (project: ProjectSummary) => void
  projects: ProjectSummary[]
}

export function ProjectDrawer({
  currentProjectId,
  isOpen,
  onAddAudio,
  onAddSamples,
  onClose,
  onRemoveProject,
  onSelectProject,
  onShowProjectInfo,
  projects,
}: ProjectDrawerProps) {
  return (
    <>
      <BackdropButton
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        aria-hidden={!isOpen}
        aria-label="Close projects"
        inert={!isOpen}
        onClick={onClose}
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!isOpen}
        aria-label="Projects"
        inert={!isOpen}
      >
        <div className={styles.heading}>
          <h2>Projects</h2>
          <IconButton className={styles.closeButton} aria-label="Close projects" variant="ghost" onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        </div>
        <Button className={styles.addAudioButton} fullWidth onClick={onAddAudio}>
          <Plus aria-hidden="true" />
          Add audio
        </Button>
        <Button className={styles.addAudioButton} fullWidth onClick={onAddSamples}>
          <Plus aria-hidden="true" />
          Add sample projects
        </Button>
        <div className={styles.projects}>
          {projects.map((project) => (
            <div key={project.projectId} className={styles.projectRow}>
              <Button
                className={`${styles.project} ${project.projectId === currentProjectId ? styles.currentProject : ''}`}
                variant="ghost"
                active={project.projectId === currentProjectId}
                onClick={() => onSelectProject(project)}
              >
                <span
                  className={`${styles.projectGlyph} ${project.isSample ? styles.sampleProjectGlyph : ''}`}
                >
                  <Music aria-hidden="true" />
                </span>
                <span>
                  <strong>{project.title}</strong>
                  <small>
                    {formatDuration(project.duration)} ·{' '}
                    {project.isSample ? 'Sample audio' : 'Local audio'}
                  </small>
                </span>
              </Button>
              <IconButton
                className={styles.projectInfoButton}
                aria-label={`Show information for ${project.title}`}
                title={`Show information for ${project.title}`}
                variant="secondary"
                onClick={() => onShowProjectInfo(project)}
              >
                <Info aria-hidden="true" />
              </IconButton>
              <IconButton
                className={styles.deleteProjectButton}
                aria-label={`Delete ${project.title}`}
                title={`Delete ${project.title}`}
                variant="danger"
                onClick={() => onRemoveProject(project)}
              >
                <Trash2 aria-hidden="true" />
              </IconButton>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

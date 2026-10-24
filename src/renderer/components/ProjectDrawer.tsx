import { Info, Music, Plus, Trash2, X } from 'lucide-react'
import type { ProjectRecord } from '../../shared/project'
import { formatDuration } from '../lib/format'
import styles from './ProjectDrawer.module.css'

type ProjectDrawerProps = {
  currentProjectId: string | null
  isOpen: boolean
  onAddAudio: () => void
  onAddSamples: () => void
  onClose: () => void
  onRemoveProject: (project: ProjectRecord) => void
  onSelectProject: (project: ProjectRecord) => void
  onShowProjectInfo: (project: ProjectRecord) => void
  projects: ProjectRecord[]
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
      <button
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
          <button className={styles.closeButton} aria-label="Close projects" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        <button className={styles.addAudioButton} onClick={onAddAudio}>
          <Plus aria-hidden="true" />
          Add audio
        </button>
        <button className={styles.addAudioButton} onClick={onAddSamples}>
          <Plus aria-hidden="true" />
          Add sample projects
        </button>
        <div className={styles.projects}>
          {projects.map((project) => (
            <div key={project.projectId} className={styles.projectRow}>
              <button
                className={`${styles.project} ${project.projectId === currentProjectId ? styles.currentProject : ''}`}
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
              </button>
              <button
                className={styles.projectInfoButton}
                aria-label={`Show information for ${project.title}`}
                title={`Show information for ${project.title}`}
                onClick={() => onShowProjectInfo(project)}
              >
                <Info aria-hidden="true" />
              </button>
              <button
                className={styles.deleteProjectButton}
                aria-label={`Delete ${project.title}`}
                title={`Delete ${project.title}`}
                onClick={() => onRemoveProject(project)}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

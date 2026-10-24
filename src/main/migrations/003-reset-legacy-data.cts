import type { Migration } from './types.cjs'

export const migration: Migration = {
  version: 3,
  migrate(database) {
    database.prepare('DELETE FROM projects').run()
    database.prepare('DELETE FROM waveforms').run()
    database.prepare('DELETE FROM metadata').run()
  },
}

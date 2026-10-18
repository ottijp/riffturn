import styles from './AppFooter.module.css'

export function AppFooter({ buildYear }: { buildYear: number }) {
  return (
    <footer className={styles.footer}>
      <span>RiffTurn © {buildYear} ottijp</span>
    </footer>
  )
}

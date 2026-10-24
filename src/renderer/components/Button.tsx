import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classNames } from '../lib/class-names'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  fullWidth?: boolean
  loading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

type IconButtonProps = Omit<ButtonProps, 'aria-label' | 'children' | 'fullWidth'> & {
  // IconButton needs aria-label and children (icon)
  'aria-label': string
  children: ReactNode
}

// button prop for closing dialogs and drawers
type BackdropButtonProps = Omit<ButtonProps, 'children' | 'variant'>

export function Button({
  active = false,
  className,
  children,
  disabled = false,
  fullWidth = false,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || props['aria-busy']}
      className={classNames(
        styles.root,
        styles[variant],
        styles[size],
        active && styles.active,
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span className={styles.loadingIndicator} aria-hidden="true" /> : children}
    </button>
  )
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return <Button {...props} className={classNames(styles.iconOnly, className)} />
}

export function BackdropButton({ className, ...props }: BackdropButtonProps) {
  return <Button {...props} className={classNames(styles.backdrop, className)} />
}

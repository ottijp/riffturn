import { app, Menu } from 'electron'

function hideDevTools(menu: Menu): void {
  for (const item of menu.items) {
    if (item.role?.toLowerCase() === 'toggledevtools') {
      item.visible = false
      item.enabled = false
    }
    if (item.submenu) hideDevTools(item.submenu)
  }
}

export function configureMenu(): void {
  if (!app.isPackaged) return
  const menu = Menu.getApplicationMenu()
  if (menu) hideDevTools(menu)
}

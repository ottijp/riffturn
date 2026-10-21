import { net, protocol } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function registerRiffTurnScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'riffturn',
      privileges: {
        standard: true,
        secure: true,
      },
    },
  ])
}

export function registerRiffTurnProtocol(): void {
  protocol.handle('riffturn', (request) => {
    const requestUrl = new URL(request.url)
    const requestedPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '')
    const relativePath =
      !requestedPath || requestedPath.endsWith('/') ? `${requestedPath}index.html` : requestedPath
    const distributionPath = path.resolve(__dirname, '..', '..')
    const assetPath = path.resolve(distributionPath, relativePath)
    if (!assetPath.startsWith(distributionPath + path.sep) && assetPath !== distributionPath) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(pathToFileURL(assetPath).toString())
  })
}

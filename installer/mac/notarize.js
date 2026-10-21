import { notarize } from '@electron/notarize'
import applicationIdentity from '#app-identity' with { type: 'json' }

export default async function (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appBundleId: applicationIdentity.appId,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  })
}

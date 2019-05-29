import * as fs from 'fs-extra'
import * as path from 'path'

import { IMiniAppBuildConfig } from '../util/types'
import { BUILD_TYPES } from '../util/constants'
import * as npmProcess from '../util/npm'
import { getBabelConfig } from '../util'

import {
  setBuildData,
  setIsProduction,
  getBuildData
} from './helper'

export async function build (appPath: string, { watch, adapter = BUILD_TYPES.WEAPP, envHasBeenSet = false, port, release }: IMiniAppBuildConfig) {
  const buildData = setBuildData(appPath, adapter)
  const isQuickApp = adapter === BUILD_TYPES.QUICKAPP
  process.env.TARO_ENV = adapter
  if (!envHasBeenSet) {
    setIsProduction(process.env.NODE_ENV === 'production' || !watch)
  }
  fs.ensureDirSync(buildData.outputDir)

  await buildWithWebpack({
    appPath
  })

}

async function buildWithWebpack ({ appPath }: { appPath: string }) {
  const {
    entryFilePath,
    outputDir,
    sourceDir,
    buildAdapter,
    projectConfig,
    isProduction,
    constantsReplaceList
  } = getBuildData()
  const miniRunner = await npmProcess.getNpmPkg('@tarojs/mini-runner', appPath)
  const babelConfig = getBabelConfig(projectConfig!.plugins!.babel)
  const miniRunnerOpts = {
    entry: {
      app: entryFilePath
    },
    outputDir,
    buildAdapter,
    plugins: {
      babel: babelConfig
    },
    isWatch: !isProduction,
    designWidth: projectConfig.designWidth,
    deviceRatio: projectConfig.deviceRatio
  }
  miniRunner(miniRunnerOpts)
}
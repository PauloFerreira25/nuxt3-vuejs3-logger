import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { LogLevels } from 'vuejs3-logger/dist/enum/log-levels'
import { ILoggerOptions } from 'vuejs3-logger/dist/interfaces/logger-options'

// Module options TypeScript interface definition
export interface ModuleOptions extends ILoggerOptions { }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt3-vuejs3-logger',
    configKey: 'nuxt3Vuejs3Logger'
  },
  defaults: {
    // optional : defaults to true if not specified
    isEnabled: true,
    // required ['debug', 'info', 'warn', 'error', 'fatal']
    logLevel: LogLevels.INFO,
    // optional : defaults to false if not specified
    stringifyArguments: false,
    // optional : defaults to false if not specified
    showLogLevel: false,
    // optional : defaults to false if not specified
    showMethodName: false,
    // optional : defaults to '|' if not specified
    separator: '|',
    // optional : defaults to false if not specified
    showConsoleColors: false
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      ssr: false,
    })
  }
})

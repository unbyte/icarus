import { BotOptions } from './bot/index.ts'
import { Logger } from './logger/index.ts'

export interface Config extends BotOptions {
  logfile: string
}

const outerConfig = JSON.parse(
  Deno.readTextFileSync('./config.json'),
) as Partial<Config>

if (outerConfig.logfile) {
  outerConfig.logger = new Logger({
    targets: [{
      path: outerConfig.logfile,
      levels: ['ERROR'],
    }],
  })
} else {
  outerConfig.logger = undefined
}

if (!outerConfig.webhook || !outerConfig.key) {
  throw new Error('missing webhook or security key')
}

export const config = outerConfig as BotOptions

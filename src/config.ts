import { BotOptions } from './bot/index.ts'

export const config = {
  webhook: '',
  key: '',
  debug: false,
  ...JSON.parse(Deno.readTextFileSync('./config.json')),
} as BotOptions

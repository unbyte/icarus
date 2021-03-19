import { Bot } from './bot/index.ts'
import { config } from './config.ts'
import { useGoBlog } from './provider/index.ts'

new Bot(
  [
    useGoBlog({ interval: 30 }),
  ],
  {
    ...config,
    debug: true,
  },
).start()

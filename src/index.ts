import { Bot } from './bot/index.ts'
import { config } from './config.ts'
import { useGoBlog } from './provider/goblog.ts'

new Bot(
  [
    useGoBlog({ interval: 30, debug: true }),
  ],
  {
    ...config,
    debug: true,
  },
).start()

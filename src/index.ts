import { Bot } from './bot/index.ts'
import { config } from './config.ts'
import { useGithubBlog, useGoBlog, useRustBlog } from './provider/index.ts'

new Bot(
  [
    useGoBlog({ interval: 30 }),
    useGithubBlog({ interval: 30 }),
    useRustBlog({ interval: 30, debug: true }),
  ],
  {
    ...config,
    debug: true,
  },
).start()

import { Bot } from './bot/index.ts'
import { config } from './config.ts'
import {
  useCNCFBlog,
  useECMADaily,
  useGithubBlog,
  useGoBlog,
  useRustBlog,
  useTypescriptBlog,
} from './provider/index.ts'

new Bot(
  [
    useGoBlog({ interval: 60 }),
    useGithubBlog({ interval: 30 }),
    useRustBlog({ interval: 60 }),
    useECMADaily({ interval: 30 }),
    useCNCFBlog({ interval: 90 }),
    useTypescriptBlog({ interval: 90 }),
  ],
  {
    ...config,
  },
).start()

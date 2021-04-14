import { Bot } from './bot/index.ts'
import { config } from './config.ts'
import {
  useChromeBlog,
  useChromiumBlog,
  useCNCFBlog,
  useCooperpressPublications,
  useECMADaily,
  useGithubBlog,
  useGoBlog,
  useKernelPlanet,
  useMozillaHacks,
  usePythonBlog,
  useRustBlog,
  useRustWeekly,
  useTypescriptBlog,
} from './provider/index.ts'

new Bot(
  [
    useGoBlog({ interval: 60 }),
    useGithubBlog({ interval: 30 }),
    useRustBlog({ interval: 60 }),
    useECMADaily({ interval: 30 }),
    // useCNCFBlog({ interval: 90 }),
    useTypescriptBlog({ interval: 90 }),
    usePythonBlog({ interval: 90 }),
    useMozillaHacks({ interval: 90 }),
    useChromiumBlog({ interval: 90 }),
    useKernelPlanet({ interval: 90 }),
    useCooperpressPublications({ interval: 90 }),
    useRustWeekly({ interval: 60 }),
    useChromeBlog({ interval: 60 }),
  ],
  {
    ...config,
  },
).start()

import { Logger } from '../logger/index.ts'
import { Message } from './msg.ts'
import { Task } from './task.ts'
import { getInterval, getSignature, getTimeStamp } from './util.ts'

export interface BotOptions {
  webhook: string
  key: string

  logger?: Logger

  debug?: boolean

  // interval unit: minute
  interval?: {
    min?: number
    max?: number
  }

  excludes?: string[]
}

export class Bot {
  #tasks: Task[]
  #options: BotOptions
  #logger: Logger

  #timers: ReturnType<typeof setInterval>[] = []

  constructor(tasks: (Task[] | Task)[], options: BotOptions) {
    this.#options = options
    this.#logger = options.logger || new Logger()
    this.#tasks = tasks.flat()
    if (options.excludes?.length) {
      this.#tasks = this.#tasks.filter(
        t => !options.excludes!.includes(t.meta.name),
      )
    }
  }

  start() {
    if (this.#options.debug) this.#debug()
    else this.#start()
  }

  #debug = () => {
    this.#tasks.filter(t => t.meta.debug).forEach(t => {
      this.#logger.info(`#Task[${t.meta.name}] is debugging`)
      this.#runTask(t).then()
    })
  }

  #start = () => {
    const minInterval = this.#options.interval?.min
    const maxInterval = this.#options.interval?.max

    this.#tasks.forEach((t, i) => {
      this.#logger.info(`#Task[${t.meta.name}] is starting`)
      // run directly for the first time
      this.#runTask(t).then()

      this.#timers[i] = setInterval(() => {
        this.#logger.info(`#Task[${t.meta.name}] is running on schedule`)
        this.#runTask(t).then()
      }, getInterval(t.meta.interval, minInterval, maxInterval))
    })
  }

  #runTask = async (task: Task) => {
    const msg = await task.run().catch(
      err => {
        this.#logger.error(
          `Error raised when running #Task[${task.meta.name}]`,
          err,
        )
        return Promise.resolve([] as Message[])
      },
    )
    if (msg.length) {
      this.#logger.info(
        `#Task[${task.meta.name}] finds ${msg.length} new article(s)`,
      )
    }

    msg.forEach(m =>
      this.#send(m)
        .catch(
          err => {
            this.#logger.error(
              `Error raised when sending message by #Task[${task.meta.name}]\nMessage:\n${
                JSON.stringify(m)
              }\n`,
              err,
            )
            return Promise.resolve()
          },
        )
    )
  }

  stop() {
    this.#timers.forEach(t => clearInterval(t))
  }

  #send = (msg: Message) => {
    const timestamp = getTimeStamp(new Date())
    const signature = getSignature(timestamp, this.#options.key)
    return fetch(this.#options.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: timestamp,
        sign: signature,
        ...msg,
      }),
    })
      .then(resp => resp.json())
      .then(json => {
        if (json.StatusCode !== 0) {
          throw new Error(
            `Response: \n${JSON.stringify(json)}`,
          )
        }
      })
  }
}

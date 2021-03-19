import { alert } from '../alert/alert.ts'
import { Message } from './msg.ts'
import { Task } from './task.ts'
import { getInterval, getSignature, getTimeStamp } from './util.ts'

export interface BotOptions {
  webhook: string
  key: string

  debug?: boolean

  // interval unit: minute
  interval?: {
    min?: number
    max?: number
  }
}

export class Bot {
  #tasks: Task[]
  #options: BotOptions

  #timers: ReturnType<typeof setInterval>[] = []

  constructor(tasks: (Task[] | Task)[], options: BotOptions) {
    this.#options = options
    this.#tasks = tasks.flat()
  }

  start() {
    if (this.#options.debug) this.#debug()
    else this.#start()
  }

  #debug = () => {
    this.#tasks.filter(t => t.meta.debug).forEach(t => {
      console.log(`#Task[${t.meta.name}] is debugging`)
      this.#runTask(t).then()
    })
  }

  #start = () => {
    const minInterval = this.#options.interval?.min
    const maxInterval = this.#options.interval?.max

    this.#tasks.forEach((t, i) => {
      console.log(`#Task[${t.meta.name}] is starting`)
      // for the first time, just run without sending message
      t.run().then()

      this.#timers[i] = setInterval(() => {
        console.log(`#Task[${t.meta.name}] is running on schedule`)
        this.#runTask(t).then()
      }, getInterval(t.meta.interval, minInterval, maxInterval))
    })
  }

  #runTask = async (task: Task) => {
    const msg = await task.run()
    msg.forEach(m =>
      this.#send(m)
        .catch(
          err => {
            alert({
              error: err,
              content:
                `Error raised when sending message from #Task[${task.meta.name}]\nMessage:\n${
                  JSON.stringify(m)
                }`,
            })
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
          throw new Error('fail to send message')
        }
      })
  }
}

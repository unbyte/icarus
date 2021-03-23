import { BufferedFile } from './util.ts'

export type LogLevel = 'INFO' | 'ERROR'

export interface LoggerOptions {
  targets: { path: string; levels: LogLevel[] }[]
  bufferSize?: number
}

export class Logger {
  #output: Record<LogLevel, BufferedFile[]> = {
    INFO: [],
    ERROR: [],
  }

  #openedFiles: Deno.File[] = []
  #usingBuffers: BufferedFile[] = []

  constructor(options?: LoggerOptions) {
    if (options) {
      const bufferSize = options.bufferSize ?? 2048
      options.targets.forEach(t => {
        const f = Deno.openSync(t.path, {
          write: true,
          create: true,
          append: true,
        })
        const buf = new BufferedFile(f, bufferSize)
        this.#openedFiles.push(f)
        this.#usingBuffers.push(buf)
        t.levels.forEach(l => this.#output[l].push(buf))
      })

      window.addEventListener('unload', this.#destroy)
    }
  }

  #destroy = () => {
    this.#usingBuffers.forEach(b => b.flush())
    this.#openedFiles.forEach(f => f.close())
    removeEventListener('unload', this.#destroy)
  }

  info(...data: any[]) {
    this.#log('INFO', data)
  }

  error(...data: any[]) {
    this.#log('ERROR', data)
  }

  #log = (level: LogLevel, data: any[]) => {
    const msg = `[${new Date().toISOString()}] [${level}] ${
      data.map(d => this.#asString(d)).join(' ')
    }`
    console.log(msg)
    this.#output[level].forEach(b => b.writeString(msg + '\n'))
  }

  #asString = (data: unknown) => {
    if (typeof data === 'string') {
      return data
    } else if (
      data === null ||
      typeof data === 'number' ||
      typeof data === 'bigint' ||
      typeof data === 'boolean' ||
      typeof data === 'undefined' ||
      typeof data === 'symbol'
    ) {
      return String(data)
    } else if (data instanceof Error) {
      return data.stack!
    } else if (typeof data === 'object') {
      return JSON.stringify(data)
    }
    return 'undefined'
  }
}

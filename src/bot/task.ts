import { Message } from './msg.ts'

export interface TaskMeta {
  name: string
  // interval unit: minute
  interval: number

  debug: boolean
}

export interface Task {
  meta: TaskMeta

  run(): Promise<Message[]>
}

import { Message } from '../bot/msg.ts'
import { Task } from '../bot/task.ts'
import { TaskMeta } from '../bot/task.ts'

export interface Option {
  interval?: number
  debug?: boolean
}

export type Store = Map<any, any>

export type SpecProvider<O extends Option> = (option?: O) => Task[]
export type CommonProvider<S, O extends Option> = (
  src: S[],
  option?: O,
) => Task[]

export type SpecInitializer<O extends Option, M extends TaskMeta> = (
  option?: O,
) => M[]
export type CommonInitializer<S, O extends Option, M extends TaskMeta> = (
  src: S[],
  option?: O,
) => M[]

export type Runner<M extends TaskMeta> = (
  meta: M,
  store: Store,
) => Promise<Message[]>

export function createSpecProvider<O extends Option, M extends TaskMeta>(
  initializer: SpecInitializer<O, M>,
  runner: Runner<M>,
): SpecProvider<O> {
  return option => initializer(option).map(meta => metaToTask(meta, runner))
}

export function createCommonProvider<S, O extends Option, M extends TaskMeta>(
  initializer: CommonInitializer<S, O, M>,
  runner: Runner<M>,
): CommonProvider<S, O> {
  return (src, option) =>
    initializer(src, option).map(meta => metaToTask(meta, runner))
}

function metaToTask<O extends Option, M extends TaskMeta>(
  meta: M,
  runner: Runner<M>,
): Task {
  const store = new Map()
  return {
    meta,
    run: () => runner(meta, store),
  } as Task
}

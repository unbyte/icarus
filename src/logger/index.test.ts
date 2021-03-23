import { assert } from 'asserts'
import { Logger } from './index.ts'

Deno.test('write log', () => {
  const path = Deno.makeTempFileSync()
  const logger = new Logger({
    targets: [{
      path,
      levels: ['ERROR'],
    }],
    bufferSize: 0,
  })
  logger.error(1, 'ok', true, { test: true }, new Error(`it's not error 😀`))
  dispatchEvent(new Event('unload'))
  const written = Deno.readTextFileSync(path)
  assert(written.length > 0)
  Deno.removeSync(path)
})

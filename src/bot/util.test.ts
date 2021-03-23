import { assertEquals } from 'asserts'
import { getInterval, getSignature, getTimeStamp } from './util.ts'

Deno.test('get timestamp', () => {
  const testCases = [{
    time: new Date('2020/3/18 20:00:00'),
    expect: '1584532800',
  }]

  testCases.forEach(c => assertEquals(getTimeStamp(c.time), c.expect))
})

Deno.test('get signature', () => {
  const testCases = [{
    timestamp: '1584532800',
    key: '9RfDwbCf5MqJ54F8FUktw',
    expect: 'YftbIE5F81bUnsLwj5Av5Ahfxsa/71+f4Th4tPR7GaA=',
  }]

  testCases.forEach(c =>
    assertEquals(getSignature(c.timestamp, c.key), c.expect)
  )
})

Deno.test('get interval', () => {
  const testCases = [
    { src: 2, min: 1, max: 3, expect: 2 * 60 * 1000 },
    { src: 2, min: 3, expect: 3 * 60 * 1000 },
    { src: 4, max: 3, expect: 3 * 60 * 1000 },
  ]

  testCases.forEach(c =>
    assertEquals(getInterval(c.src, c.min, c.max), c.expect)
  )
})

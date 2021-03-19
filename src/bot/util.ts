import { sha256 } from 'sha256'

export function getTimeStamp(time: Date): string {
  return time.getTime().toString().substring(0, 10)
}

export function getSignature(timestamp: string, key: string): string {
  return sha256(timestamp + '\n' + key, 'utf8', 'base64') as string
}

export function getInterval(interval: number, min?: number, max?: number) {
  if (min && interval < min) return min * 60 * 1000
  if (max && interval > max) return max * 60 * 1000
  return interval * 60 * 1000
}

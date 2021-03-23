export class BufferedFile {
  #encoder = new TextEncoder()
  #buf: Uint8Array
  #usedBufferBytes = 0
  #err: Error | null = null

  constructor(private file: Deno.File, size: number = 2048) {
    if (size <= 0) size = 2048
    this.#buf = new Uint8Array(size)
  }

  available(): number {
    return this.#buf.byteLength - this.#usedBufferBytes
  }

  buffered(): number {
    return this.#usedBufferBytes
  }

  flush(): void {
    if (this.#err !== null) throw this.#err
    if (this.#usedBufferBytes === 0) return

    try {
      Deno.writeAllSync(
        this.file,
        this.#buf.subarray(0, this.#usedBufferBytes),
      )
    } catch (e) {
      this.#err = e
      throw e
    }

    this.#buf = new Uint8Array(this.#buf.length)
    this.#usedBufferBytes = 0
  }

  writeString(data: string): number {
    return this.write(this.#encoder.encode(data))
  }

  write(data: Uint8Array): number {
    if (this.#err !== null) throw this.#err
    if (data.length === 0) return 0

    let totalBytesWritten = 0
    let numBytesWritten = 0
    while (data.byteLength > this.available()) {
      if (this.buffered() === 0) {
        try {
          numBytesWritten = this.file.writeSync(data)
        } catch (e) {
          this.#err = e
          throw e
        }
      } else {
        numBytesWritten = copy(data, this.#buf, this.#usedBufferBytes)
        this.#usedBufferBytes += numBytesWritten
        this.flush()
      }
      totalBytesWritten += numBytesWritten
      data = data.subarray(numBytesWritten)
    }

    numBytesWritten = copy(data, this.#buf, this.#usedBufferBytes)
    this.#usedBufferBytes += numBytesWritten
    totalBytesWritten += numBytesWritten
    return totalBytesWritten
  }
}

function copy(src: Uint8Array, dst: Uint8Array, off = 0): number {
  off = Math.max(0, Math.min(off, dst.byteLength))
  const dstBytesAvailable = dst.byteLength - off
  if (src.byteLength > dstBytesAvailable) {
    src = src.subarray(0, dstBytesAvailable)
  }
  dst.set(src, off)
  return src.byteLength
}

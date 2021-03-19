export interface Alert {
  time: Date
  error: Error
  content: any
}

export async function alert(msg: Partial<Alert>) {
  console.trace(msg.error)
  // TODO warn by email
}

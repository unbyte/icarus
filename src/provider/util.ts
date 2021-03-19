export async function fetchPage(url: string, options?: RequestInit) {
  return fetch(url, {
    redirect: 'follow',
    ...options,
  }).then(
    resp => resp.text(),
  )
}

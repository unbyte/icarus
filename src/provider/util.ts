import { Options, Parser } from 'xml'

export async function fetchPage(url: string, options?: RequestInit) {
  return fetch(url, {
    redirect: 'follow',
    ...options,
  }).then(
    resp => resp.text(),
  )
}

export async function fetchXML(
  url: string,
  fetchOptions?: RequestInit,
  xmlOptions: Partial<Options> = {},
) {
  return fetchPage(url, fetchOptions).then(
    xml => new Parser(xmlOptions).parse(xml),
  )
}

export function removeTags(escaped: string) {
  return escaped.replaceAll(/\n/g, ' ').replaceAll(
    /<\/?.+?>/g,
    '',
  )
}

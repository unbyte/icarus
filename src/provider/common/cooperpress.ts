import { Node, Options, unescapeEntity } from 'xml'
import {
  CardMsgHeaderTemplate,
  createCardMessage,
  Message,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { TaskMeta } from '../../bot/task.ts'
import { createCommonProvider, Option, Store } from '../provider.ts'
import { fetchXML } from '../util.ts'

export interface CooperpressSource {
  url: string
  name: string
  theme?: CardMsgHeaderTemplate

  xmlParseOptions?: Partial<Options>
}

export interface CooperpressOption extends Option {
}

export interface CooperpressMeta extends TaskMeta, CooperpressSource {
}

export const useCooperpress = createCommonProvider<
  CooperpressSource,
  CooperpressOption,
  CooperpressMeta
>(
  initializer,
  runner,
)

function initializer(
  sources: CooperpressSource[],
  option?: CooperpressOption,
): CooperpressMeta[] {
  return sources.map(source => {
    return {
      theme: CardMsgHeaderTemplate.PURPLE,
      interval: 60,
      debug: false,
      xmlParseOptions: {
        ignoreAttrs: true,
      },
      ...source,
      ...option,
    }
  })
}

const timeStoreKey = 'TIME'

async function runner(
  meta: CooperpressMeta,
  store: Store,
): Promise<Message[]> {
  const root = await fetchXML(meta.url, {}, meta.xmlParseOptions)
  if (!root) return []

  const articles = root.find(['rss', 'channel', 'item'])

  if (!meta.debug) {
    // get cached last time
    const lastTime: number = store.get(timeStoreKey)
    // get current publication time
    const newestTime = getPublishedDate(articles[0]).getTime()

    store.set(timeStoreKey, newestTime)

    // set cache and return empty msg for the first time
    if (!lastTime || newestTime <= lastTime) return []
  }

  const content = unescapeEntity(
    articles[0].getChild('description')?.getValue('') || '',
  )

  const title = `**#${getId(content)}\n${
    getPublishedDate(articles[1]).toLocaleDateString('zh-cn')
  } - ${getPublishedDate(articles[0]).toLocaleDateString('zh-cn')}**`

  const outlines = getItems(content)
    .map((o, i) => `**${i}.**  [${o.title}](${o.url})`)
    .join('\n')

  // generate message
  return [
    createCardMessage(
      {
        header: {
          template: meta.theme,
          title: useText(meta.name),
        },
        elements: [
          useModuleContent({
            text: useMDText(title),
            fields: [
              useField(useMDText('')), // for margin
              useField(useMDText(outlines)),
              useField(useMDText('')), // for margin
            ],
            extra: useButton(useText('Open Newsletter'), {
              url: articles[0].getChild('link')?.getValue('') || '',
            }),
          }),
        ],
      },
    ),
  ]
}

function getPublishedDate(node: Node) {
  return new Date(node.getChild('pubDate')?.getValue('') || 0)
}

const idRegexp = /<p>#\s*(\d+)\s*— /

function getId(content: string) {
  return content.match(idRegexp)?.[1] || 'unknown'
}

const itemsRegexp =
  /(?<outline><a href="(.+?)" title.+?>(.+?)<\/a>)|(?<category><strong>(.+?)<\/strong>)/g

type Item = {
  title: string
  url: string
}

function getItems(content: string) {
  const matched = content.matchAll(itemsRegexp)
  const result: Item[] = []
  let skip = false
  for (const item of matched) {
    if (item.groups!.outline) {
      if (skip) continue
      result.push({
        url: item[2],
        title: item[3],
      })
    } else {
      // remove job category and its children
      skip = item[5].toLowerCase().includes('job')
    }
  }
  return result
}

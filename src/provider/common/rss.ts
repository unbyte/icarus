import { Node, Options } from 'xml'
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

export interface RSSArticle {
  title: string
  url: string
  author: string
  category: string[]
  summary: string
}

export interface RSSSource {
  url: string
  name: string
  theme?: CardMsgHeaderTemplate

  xmlParseOptions?: Partial<Options>

  nodeToArticle(node: Node): RSSArticle
}

export interface RSSOption extends Option {
}

export interface RSSMeta extends TaskMeta, RSSSource {
}

export const useRSS = createCommonProvider<RSSSource, RSSOption, RSSMeta>(
  initializer,
  runner,
)

function initializer(
  sources: RSSSource[],
  option?: RSSOption,
): RSSMeta[] {
  return sources.map(source => {
    return {
      theme: CardMsgHeaderTemplate.PURPLE,
      interval: 60,
      debug: false,
      ...source,
      ...option,
    }
  })
}

const timeStoreKey = 'TIME'

async function runner(
  meta: RSSMeta,
  store: Store,
): Promise<Message[]> {
  const root = await fetchXML(meta.url, {}, meta.xmlParseOptions)
  if (!root) return []

  const articles = root.find(['rss', 'channel', 'item'])

  let newArticles: Node[]

  if (meta.debug) {
    newArticles = articles.slice(0, 1)
  } else {
    // get cached update time
    const lastUpdateTimestamp: number = store.get(timeStoreKey)
    // get current time
    const currentUpdateTimestamp = new Date().getTime()
    store.set(timeStoreKey, currentUpdateTimestamp)

    // set cache and return empty msg for the first time
    if (!lastUpdateTimestamp) return []

    const lastUpdateIdx = articles.findIndex(
      item =>
        new Date(item.getChild('pubDate')?.getValue('') || 0).getTime() <=
          lastUpdateTimestamp,
    )

    if (lastUpdateIdx === -1) throw new Error('fail to compare newer article')

    newArticles = articles.slice(0, lastUpdateIdx)
  }

  // generate message
  return newArticles.map(node => {
    const item = meta.nodeToArticle(node)
    return createCardMessage(
      {
        header: {
          template: meta.theme,
          title: useText(meta.name),
        },
        elements: [
          useModuleContent({
            text: useMDText(`**${item.title}**`),
            fields: [
              useField(useMDText('')), // for margin
              useField(useMDText(`**Authors**: ${item.author}`)),
              useField(useMDText('')), // for margin
              useField(
                useMDText(`**Category**: *${item.category.join(', ')}*`),
              ),
              useField(useMDText('')), // for margin
              useField(useMDText(`**Summary**: \n${item.summary}`)),
              useField(useMDText('')), // for margin
            ],
            extra: useButton(useText('Read Article'), {
              url: item.url,
            }),
          }),
        ],
      },
    )
  })
}

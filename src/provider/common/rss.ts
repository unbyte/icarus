import { Node, Options } from 'xml'
import {
  CardMsgHeaderTemplate,
  CardMsgModule,
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
import { fetchXML, removeTags } from '../util.ts'

export interface RSSArticle {
  title: string
  url: string
  author: string
  category: string[]
  summary: string
  publishedTime: string
}

export interface RSSSource {
  url: string
  name: string
  theme?: CardMsgHeaderTemplate

  xmlParseOptions?: Partial<Options>

  // guid is not a required prop in RSS 2.0 spec so can use time prop to compare instead
  compareByTime?: boolean

  nodeToArticle?(node: Node): RSSArticle

  articleToMessageBody?(article: RSSArticle): CardMsgModule[]
}

export interface RSSOption extends Option {
}

export interface RSSMeta extends TaskMeta, RSSSource {
  nodeToArticle(node: Node): RSSArticle

  articleToMessageBody(article: RSSArticle): CardMsgModule[]
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
      nodeToArticle: defaultRSSNodeToArticle,
      articleToMessageBody: defaultRSSArticleToMessageBody,
      xmlParseOptions: {
        ignoreAttrs: true,
      },
      compareByTime: false,
      ...source,
      ...option,
    }
  })
}

const timeStoreKey = 'TIME'
const idStoreKey = 'ID'

async function runner(
  meta: RSSMeta,
  store: Store,
): Promise<Message[]> {
  const root = await fetchXML(meta.url, {}, meta.xmlParseOptions)
  if (!root) return []

  const articles = root.find(['rss', 'channel', 'item'])

  if (!articles.length) throw new Error('fail to fetch articles')

  let newArticles: Node[]

  if (meta.debug) {
    newArticles = articles.slice(0, 1)
  } else {
    let lastUpdateIdx = -1
    if (meta.compareByTime) {
      // get cached update time
      const lastUpdateTimestamp: number = store.get(timeStoreKey)
      // get current time
      const currentUpdateTimestamp = new Date().getTime()
      store.set(timeStoreKey, currentUpdateTimestamp)
      // return empty msg for the first time
      if (!lastUpdateTimestamp) return []

      lastUpdateIdx = articles.findIndex(
        item =>
          new Date(item.getChild('pubDate')?.getValue('') || 0).getTime() <=
            lastUpdateTimestamp,
      )
    } else {
      // get cached id
      const lastUpdateID: string = store.get(idStoreKey)
      store.set(idStoreKey, articles[0]?.getChild('guid')?.getValue(''))
      // return empty msg for the first time
      if (!lastUpdateID) return []

      lastUpdateIdx = articles.findIndex(
        item => item.getChild('guid')?.getValue('') === lastUpdateID,
      )
    }

    if (lastUpdateIdx === -1) throw new Error('fail to compare newer article')

    newArticles = articles.slice(0, lastUpdateIdx)
  }

  // generate message
  return newArticles.map(node =>
    createCardMessage(
      {
        header: {
          template: meta.theme,
          title: useText(meta.name),
        },
        elements: meta.articleToMessageBody(meta.nodeToArticle(node)),
      },
    )
  )
}

function defaultRSSNodeToArticle(node: Node): RSSArticle {
  return {
    title: node.getChild('title')?.getValue('') || '',
    url: node.getChild('link')?.getValue('') || '',
    author: node.getChild('creator')?.getValue('') || '',
    category: node.getChildren('category').map(c => c.getValue('')),
    summary: removeTags(
      node.getChild('encoded')?.getValue('').match(/<p>([\s\S]*?)<\/p>/)
        ?.[1] || '',
    ),
    publishedTime: node.getChild('pubDate')?.getValue('') || '',
  }
}

function defaultRSSArticleToMessageBody(
  article: RSSArticle,
): CardMsgModule[] {
  return [
    useModuleContent({
      text: useMDText(`**${article.title}**`),
      fields: [
        useField(useMDText('')), // for margin
        useField(useMDText(`**Authors**: ${article.author}`)),
        useField(useMDText('')), // for margin
        useField(
          useMDText(`**Category**: *${article.category.join(', ')}*`),
        ),
        useField(useMDText('')), // for margin
        useField(useMDText(`**Summary**: \n${article.summary}`)),
        useField(useMDText('')), // for margin
      ],
      extra: useButton(useText('Read Article'), {
        url: article.url,
      }),
    }),
  ]
}

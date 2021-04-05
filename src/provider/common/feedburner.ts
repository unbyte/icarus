import { Node, unescapeEntity } from 'xml'
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

export interface FeedburnerArticle {
  title: string
  url: string
  author: string
  summary: string
  publishedTime: string
  updatedTime: string
}

export interface FeedburnerSource {
  url: string
  name: string
  theme?: CardMsgHeaderTemplate

  nodeToArticle?(node: Node): FeedburnerArticle

  articleToMessageBody?(article: FeedburnerArticle): CardMsgModule[]
}

export interface FeedburnerOption extends Option {
}

export interface FeedburnerMeta extends TaskMeta, FeedburnerSource {
  nodeToArticle(node: Node): FeedburnerArticle

  articleToMessageBody(article: FeedburnerArticle): CardMsgModule[]
}

export const useFeedburner = createCommonProvider(
  initializer,
  runner,
)

function initializer(
  sources: FeedburnerSource[],
  option?: FeedburnerOption,
): FeedburnerMeta[] {
  return sources.map(source => {
    return {
      theme: CardMsgHeaderTemplate.PURPLE,
      interval: 60,
      debug: false,
      nodeToArticle: defaultFeedburnerNodeToArticle,
      articleToMessageBody: defaultFeedburnerArticleToMessageBody,
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
  meta: FeedburnerMeta,
  store: Store,
): Promise<Message[]> {
  const root = await fetchXML(meta.url, {})
  if (!root) return []

  const articles = root.find(['feed', 'entry'])

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
        new Date(item.getChild('published')?.getValue('') || 0).getTime() <=
          lastUpdateTimestamp,
    )

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

function defaultFeedburnerNodeToArticle(node: Node): FeedburnerArticle {
  const content = unescapeEntity(
    node.getChild('content')?.getValue('') || '',
  ).match(/<[^>]+?>([\s\S]*?)<\/[^>]+?>/g)
  let summary
  if (!content) summary = ''
  else {
    for (const block of content) {
      if (block && block !== '<br/>') {
        summary = block
        break
      }
    }
  }

  return {
    title: node.getChild('title')?.getValue('') || '',
    url:
      node.getChildren('link')?.find(l => l.getAttr('type') === 'text/html')
        ?.getAttr('href') as string || '',
    author: node.getChild('author')?.getChild('name')?.getValue('') || '',
    summary: removeTags(summary || ''),
    publishedTime: node.getChild('published')?.getValue('') || '',
    updatedTime: node.getChild('updated')?.getValue('') || '',
  }
}

function defaultFeedburnerArticleToMessageBody(
  article: FeedburnerArticle,
): CardMsgModule[] {
  return [
    useModuleContent({
      text: useMDText(`**${article.title}**`),
      fields: [
        useField(useMDText('')), // for margin
        useField(useMDText(`**Authors**: ${article.author}`)),
        useField(useMDText('')), // for margin
        useField(useMDText(`**Summary**: \n${article.summary}`)),
        useField(useMDText('')), // for margin
      ],
      extra: useButton(useText('Read Detail'), {
        url: article.url,
      }),
    }),
  ]
}

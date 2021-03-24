import { Node, Options, unescapeEntity } from 'xml'
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

export interface AtomArticle {
  title: string
  url: string
  author: string
  summary: string
  updatedTime: string
  publishedTime: string
}

export interface AtomSource {
  url: string
  name: string
  theme?: CardMsgHeaderTemplate

  xmlParseOptions?: Partial<Options>

  nodeToArticle?(node: Node): AtomArticle

  articleToMessageBody?(article: AtomArticle): CardMsgModule[]
}

export interface AtomOption extends Option {
}

export interface AtomMeta extends TaskMeta, AtomSource {
  nodeToArticle(node: Node): AtomArticle

  articleToMessageBody(article: AtomArticle): CardMsgModule[]
}

export const useAtom = createCommonProvider<AtomSource, AtomOption, AtomMeta>(
  initializer,
  runner,
)

function initializer(
  sources: AtomSource[],
  option?: AtomOption,
): AtomMeta[] {
  return sources.map(source => {
    return {
      theme: CardMsgHeaderTemplate.PURPLE,
      interval: 60,
      debug: false,
      nodeToArticle: defaultAtomNodeToArticle,
      articleToMessageBody: defaultAtomArticleToMessageBody,
      ...source,
      ...option,
    }
  })
}

const timeStoreKey = 'TIME'

async function runner(
  meta: AtomMeta,
  store: Store,
): Promise<Message[]> {
  const root = await fetchXML(meta.url, {}, meta.xmlParseOptions)
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
        new Date(
          (
            item.getChild('published')?.getValue('') ??
              item.getChild('updated')?.getValue('')
          ) || '',
        ).getTime() <= lastUpdateTimestamp,
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

function defaultAtomNodeToArticle(node: Node): AtomArticle {
  return {
    title: node.getChild('title')?.getValue('') || '',
    url: node.getChild('link')?.getAttr('href') as string || '',
    author: node.getChild('author')?.getChild('name')?.getValue('') || '',
    summary: removeTags(
      unescapeEntity(
        node.getChild('content')?.getValue('').substr(0, 600) || '',
      ).match(/<p>([\s\S]+?)<\/p>/)?.[1] || '',
    ),
    publishedTime: node.getChild('published')?.getValue('') || '',
    updatedTime: node.getChild('updated')?.getValue('') || '',
  }
}

function defaultAtomArticleToMessageBody(
  article: AtomArticle,
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
      extra: useButton(useText('Read Article'), {
        url: article.url,
      }),
    }),
  ]
}

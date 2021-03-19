import { Message } from '../../bot/msg.ts'
import {
  CardMsgHeaderTemplate,
  createCardMessage,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { TaskMeta } from '../../bot/task.ts'
import { createSpecProvider, Option, Store } from '../provider.ts'
import { fetchPage, unescapeTags } from '../util.ts'

export interface GithubBlogProviderOption extends Option {
}

export interface GithubBlogTaskMeta extends TaskMeta {
}

export const useGithubBlog = createSpecProvider<
  GithubBlogProviderOption,
  GithubBlogTaskMeta
>(
  initializer,
  runner,
)

function initializer(
  option?: GithubBlogProviderOption,
): GithubBlogTaskMeta[] {
  return [{
    name: 'github_blog',
    interval: option?.interval || 30,
    debug: option?.debug || false,
  }]
}

const cacheKey = 'cache'

async function runner(
  meta: GithubBlogTaskMeta,
  store: Store,
): Promise<Message[]> {
  const fetchedItems = await fetchItems()
  if (!fetchedItems.length) return []

  let newItems: Item[]

  if (meta.debug) {
    newItems = fetchedItems.slice(0, 1)
  } else {
    // get cached item
    const lastUpdateTime: number = store.get(cacheKey)
    // update newest time
    store.set(cacheKey, new Date(fetchedItems[0].time).getTime())

    // set cache and return empty msg for the first time
    if (!lastUpdateTime) {
      return []
    }

    // compare and get the new items
    const lastUpdateIdx = fetchedItems.findIndex(
      item => new Date(item.time).getTime() <= lastUpdateTime,
    )

    if (lastUpdateIdx === -1) throw new Error('fail to compare newer article')

    newItems = fetchedItems.slice(0, lastUpdateIdx)
  }

  // generate message
  return newItems.map(item =>
    createCardMessage(
      {
        header: {
          template: CardMsgHeaderTemplate.PURPLE,
          title: useText('Github Blog'),
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
  )
}

interface Item {
  title: string
  url: string
  author: string
  time: string
  category: string[]
  summary: string
}

async function fetchItems() {
  // <item>
  // 		<title>Using GitHub code scanning and CodeQL to detect traces of Solorigate and other backdoors</title>
  // 		<link>https://github.blog/2021-03-16-using-github-code-scanning-and-codeql-to-detect-traces-of-solorigate-and-other-backdoors/</link>
  //
  // 		<dc:creator><![CDATA[Bas van Schaik]]></dc:creator>
  // 		<pubDate>Tue, 16 Mar 2021 17:55:56 +0000</pubDate>
  // 				<category><![CDATA[Product]]></category>
  // 		<category><![CDATA[Security]]></category>
  // 		<guid isPermaLink="false">https://github.blog/?p=56696</guid>
  //
  // 					<description><![CDATA[...]]></description>
  // 										<content:encoded><![CDATA[<p>....</p>

  return fetchPage('https://github.blog/feed/').then(
    html => {
      const matched = html.matchAll(
        /<title>(.+?)<\/title>\s+<link>(.+?)<\/link>\s+.+?CDATA\[(.+?)\].+?\s+<pubDate>(.+?)<\/pubDate>(?:\s+<cat.+?CDATA\[(.+?)\].+?\s+)+[\s\S]+?<p>([\s\S]+?)<\/p>/g,
      )
      if (!matched) throw new Error('fail to parse github blog index')
      const result: Item[] = []
      for (let item of matched) {
        const lastIdx = item.length - 1
        result.push({
          title: item[1],
          url: item[2],
          author: item[3],
          time: item[4],
          category: item.slice(5, lastIdx),
          summary: unescapeTags(item[lastIdx]),
        })
      }
      return result
    },
  )
}

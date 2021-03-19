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

export interface GoBlogProviderOption extends Option {
}

export interface GoBlogTaskMeta extends TaskMeta {
}

export const useGoBlog = createSpecProvider<
  GoBlogProviderOption,
  GoBlogTaskMeta
>(
  initializer,
  runner,
)

function initializer(
  option?: GoBlogProviderOption,
): GoBlogTaskMeta[] {
  return [{
    name: 'go_blog',
    interval: option?.interval || 30,
    debug: option?.debug || false,
  }]
}

const cacheKey = 'cache'

async function runner(
  meta: GoBlogTaskMeta,
  store: Store,
): Promise<Message[]> {
  const fetchedItems = await fetchIndex()
  if (!fetchedItems.length) return []

  let newItems: Item[]

  if (meta.debug) {
    newItems = fetchedItems.slice(0, 1)
  } else {
    // get cached item
    const cachedItem: Item = store.get(cacheKey)
    // update newest item
    store.set(cacheKey, fetchedItems[0])

    // set cache for the first time
    if (!cachedItem) {
      return []
    }

    // compare and get the new items
    const cachedItemIdx = fetchedItems.findIndex(
      item =>
        item.url === cachedItem.url &&
        item.title === cachedItem.title &&
        item.date === cachedItem.date,
    )

    if (cachedItemIdx === -1) throw new Error('fail to compare newer article')

    newItems = fetchedItems.slice(0, cachedItemIdx)
  }

  // fetch summary for new items
  for (const item of newItems) {
    item.summary = await fetchArticleSummary(item.url)
  }

  // generate message
  return newItems.map(item =>
    createCardMessage(
      {
        header: {
          template: CardMsgHeaderTemplate.WATHET,
          title: useText('Go Blog'),
        },
        elements: [
          useModuleContent({
            text: useMDText(`**${item.title || ''}**`),
            fields: [
              useField(useMDText('')), // for margin
              useField(useMDText(`**Authors**: ${item.author || ''}`)),
              useField(useMDText('')), // for margin
              useField(useMDText(`**Tags**: *${item.tags || ''}*`)),
              useField(useMDText('')), // for margin
              useField(useMDText(`**Summary**: \n${item.summary || ''}`)),
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
  url: string
  title: string
  date: string
  author: string
  tags: string
  summary?: string
}

async function fetchIndex() {
  // <p class="blogtitle">
  //     <a href="/survey2020-results">Go Developer Survey 2020 Results</a>, <span class="date">9 March 2021</span><br>
  //     <span class="author">Alice Merrick<br></span>
  //     <span class="tags">survey community </span>
  // </p>
  return fetchPage('https://blog.golang.org/index').then(
    html => {
      const matched = html.matchAll(
        /blogtitle">\s+<a href="(.+?)">(.+?)<\/a>.+?"date">(.+?)<\/span><br>\s+.+?"author">(.*?)(?:<br>)*<\/span>\s+(?:.+?"tags">(.+?)<\/span>\s+)*<\/p>/g,
      )
      if (!matched) throw new Error('fail to parse go blog index')
      const result: Item[] = []
      for (let item of matched) {
        result.push({
          url: `https://blog.golang.org${item[1]}`,
          title: item[2],
          date: item[3],
          author: item[4],
          tags: item[5] || '',
        })
      }
      return result
    },
  )
}

async function fetchArticleSummary(url: string) {
  //   <h4 id="TOC_1."></h4>
  //   <p>We're happy to announce that the VS Code Go extension now enables the <a href="https://github.com/golang/tools/blob/master/gopls/README.md" target="_blank" rel="noopener">gopls
  // language server</a>
  // by default, to deliver more robust IDE features and better support for Go
  // modules.</p>
  return fetchPage(url).then(
    html => {
      const matched = html.match(/TOC_1\.">[^<]*<\/h4>\s+<p>([\s\S]+?)<\/p>/)
      if (!matched) throw new Error('fail to parse go blog article')
      return unescapeTags(matched[1])
    },
  )
}

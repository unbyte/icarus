import { unescapeEntity } from 'xml'
import {
  CardMsgHeaderTemplate,
  CardMsgModule,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { RSSArticle, RSSOption, useRSS } from '../common/rss.ts'
import { removeTags } from '../util.ts'

export const useKernelPlanet = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://planet.kernel.org/rss20.xml',
    name: 'Kernel Planet',
    theme: CardMsgHeaderTemplate.GREY,
    nodeToArticle(node): RSSArticle {
      const content = unescapeEntity(
        node.getChild('description')?.getValue('') || '',
      )
      const summary = content.match(
        content.startsWith('<p>')
          ? /<p>([\s\S]*?)<\/p>/
          : /([\s\S]+?\. [\s\S]+?\. )/,
      )?.[1] || 'no summary'

      return {
        title: node.getChild('title')?.getValue('') || '',
        url: node.getChild('link')?.getValue('') || '',
        author: '',
        category: [],
        summary: removeTags(summary),
        publishedTime: node.getChild('pubDate')?.getValue('') || '',
      }
    },
    articleToMessageBody(article: RSSArticle): CardMsgModule[] {
      return [
        useModuleContent({
          text: useMDText(`**${article.title}**`),
          fields: [
            useField(useMDText('')), // for margin
            useField(useMDText(article.summary)),
            useField(useMDText('')), // for margin
          ],
          extra: useButton(useText('Read Article'), {
            url: article.url,
          }),
        }),
      ]
    },
  }], options)
}

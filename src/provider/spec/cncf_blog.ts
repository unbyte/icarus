import {
  CardMsgHeaderTemplate,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { RSSArticle, RSSOption, useRSS } from '../common/rss.ts'

export const useCNCFBlog = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://www.cncf.io/feed/',
    name: 'CNCF Blog',
    theme: CardMsgHeaderTemplate.CARMINE,
    articleToMessageBody(article: RSSArticle) {
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
    },
  }], options)
}

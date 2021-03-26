import {
  CardMsgHeaderTemplate,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { RSSArticle, RSSOption, useRSS } from '../common/rss.ts'

export const useMozillaHacks = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://hacks.mozilla.org/category/featured/feed/',
    name: 'Mozilla Hacks Blog',
    theme: CardMsgHeaderTemplate.ORANGE,
    articleToMessageBody(article: RSSArticle) {
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

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

export const useTypescriptBlog = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://devblogs.microsoft.com/typescript/feed/',
    name: 'Typescript Blog',
    theme: CardMsgHeaderTemplate.BLUE,
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

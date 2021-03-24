import {
  CardMsgHeaderTemplate,
  CardMsgModule,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import {
  FeedburnerArticle,
  FeedburnerOption,
  useFeedburner,
} from '../common/feedburner.ts'

export const usePythonBlog = (options?: FeedburnerOption) => {
  return useFeedburner([{
    url: 'https://feeds.feedburner.com/PythonInsider',
    name: 'Python Insider Blog',
    theme: CardMsgHeaderTemplate.YELLOW,
    articleToMessageBody(article: FeedburnerArticle): CardMsgModule[] {
      return [
        useModuleContent({
          text: useMDText(`**${article.title}**`),
          fields: [
            useField(useMDText('')), // for margin
            useField(useMDText(article.summary)),
            useField(useMDText('')), // for margin
          ],
          extra: useButton(useText('Read Detail'), {
            url: article.url,
          }),
        }),
      ]
    },
  }], options)
}

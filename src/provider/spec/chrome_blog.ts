import {
  CardMsgHeaderTemplate,
  CardMsgModule,
  useButton,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { AtomArticle, AtomOption, useAtom } from '../common/atom.ts'

export const useChromeBlog = (options?: AtomOption) => {
  return useAtom([{
    url: 'https://developer.chrome.com/feeds/blog.xml',
    name: 'Chrome Blog',
    theme: CardMsgHeaderTemplate.BLUE,
    articleToMessageBody(article: AtomArticle): CardMsgModule[] {
      return [
        useModuleContent({
          text: useMDText(`**${article.title}**`),
          extra: useButton(useText('Read Article'), {
            url: article.url,
          }),
        }),
      ]
    },
  }], options)
}

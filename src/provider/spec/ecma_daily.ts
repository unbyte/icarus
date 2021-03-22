import {
  CardMsgHeaderTemplate,
  CardMsgModule,
  useButton,
  useField,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { AtomArticle, AtomOption, useAtom } from '../common/atom.ts'

export const useECMADaily = (options?: AtomOption) => {
  return useAtom([{
    url: 'https://ecmascript-daily.github.io/atom.xml',
    name: 'ECMA Daily',
    theme: CardMsgHeaderTemplate.YELLOW,
    articleToMessageBody(article: AtomArticle): CardMsgModule[] {
      return [
        useModuleContent({
          text: useMDText(`**${article.title}**`),
          fields: [
            useField(useMDText('')), // for margin
            useField(useMDText(article.summary)),
            useField(useMDText('')), // for margin
          ],
          extra: useButton(useText('Related Links'), {
            url: article.url,
          }),
        }),
      ]
    },
  }], options)
}

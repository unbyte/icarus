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
import { AtomArticle, AtomOption, useAtom } from '../common/atom.ts'
import { removeTags } from '../util.ts'

export const useChromiumBlog = (options?: AtomOption) => {
  return useAtom([{
    url: 'http://blog.chromium.org/atom.xml',
    name: 'Chromium Blog',
    theme: CardMsgHeaderTemplate.INDIGO,
    nodeToArticle(node): AtomArticle {
      return {
        title: node.getChild('title')?.getValue('') || '',
        url: node.getChildren('link').find(n =>
          n.getAttr('rel') === 'alternate'
        )?.getAttr('href') as string || '',
        author: node.getChild('author')?.getChild('name')?.getValue('') || '',
        summary: removeTags(
          unescapeEntity(
            node.getChild('content')?.getValue('') || '',
          ).match(/<p>([\s\S]+?)<\/p>/)?.[1] || '',
        ),
        publishedTime: node.getChild('published')?.getValue('') || '',
        updatedTime: node.getChild('updated')?.getValue('') || '',
      }
    },
    articleToMessageBody(article: AtomArticle): CardMsgModule[] {
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

import {
  CardMsgHeaderTemplate,
  CardMsgModule,
  useButton,
  useMDText,
  useModuleContent,
  useText,
} from '../../bot/msg.ts'
import { AtomArticle, AtomOption, useAtom } from '../common/atom.ts'

export const useRustWeekly = (options?: AtomOption) => {
  return useAtom([{
    url: 'https://this-week-in-rust.org/atom.xml',
    name: 'This Week in Rust',
    theme: CardMsgHeaderTemplate.GREY,
    nodeToArticle(node): AtomArticle {
      const id = node.getChild('title')?.getValue('')?.match(/(\d+)/)?.[1] || ''
      const updatedTime = node.getChild('updated')?.getValue('') || ''
      return {
        title: `#${id}\n${getTimePeriod(updatedTime)}`,
        url: node.getChild('link')?.getAttr('href') as string || '',
        author: '',
        summary: '',
        publishedTime: node.getChild('published')?.getValue('') || '',
        updatedTime: updatedTime,
      }
    },
    articleToMessageBody(article: AtomArticle): CardMsgModule[] {
      return [
        useModuleContent({
          text: useMDText(`**${article.title}**`),
          extra: useButton(useText('Open Newsletter'), {
            url: article.url,
          }),
        }),
      ]
    },
  }], options)
}

function getTimePeriod(updatedTime: string) {
  if (!updatedTime) return ''
  const thisTime = new Date(updatedTime)
  const lastTime = new Date(thisTime.getTime() - 1000 * 60 * 60 * 24 * 7)
  return `${lastTime.toLocaleDateString('zh-cn')} - ${
    thisTime.toLocaleDateString('zh-cn')
  }`
}

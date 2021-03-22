import { CardMsgHeaderTemplate } from '../../bot/msg.ts'
import { AtomOption, useAtom } from '../common/atom.ts'

export const useGoBlog = (options?: AtomOption) => {
  return useAtom([{
    url: 'https://blog.golang.org/feed.atom',
    name: 'Go Blog',
    theme: CardMsgHeaderTemplate.WATHET,
  }], options)
}

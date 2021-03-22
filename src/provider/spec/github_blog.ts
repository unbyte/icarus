import { CardMsgHeaderTemplate } from '../../bot/msg.ts'
import { RSSOption, useRSS } from '../common/rss.ts'

export const useGithubBlog = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://github.blog/feed/',
    name: 'Github Blog',
    theme: CardMsgHeaderTemplate.PURPLE,
  }], options)
}

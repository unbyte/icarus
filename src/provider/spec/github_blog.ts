import { CardMsgHeaderTemplate } from '../../bot/msg.ts'
import { RSSArticle, RSSOption, useRSS } from '../common/rss.ts'
import { removeTags } from '../util.ts'

export const useGithubBlog = (options?: RSSOption) => {
  return useRSS([{
    url: 'https://github.blog/feed/',
    name: 'Github Blog',
    theme: CardMsgHeaderTemplate.PURPLE,
    xmlParseOptions: {
      ignoreAttrs: true,
    },
    nodeToArticle(node): RSSArticle {
      return {
        title: node.getChild('title')?.getValue('') || '',
        url: node.getChild('link')?.getValue('') || '',
        author: node.getChild('creator')?.getValue('') || '',
        category: node.getChildren('category').map(c => c.getValue('')),
        summary: removeTags(
          node.getChild('encoded')?.getValue('').match(/<p>([\s\S]*?)<\/p>/)
            ?.[1] || '',
        ),
      }
    },
  }], options)
}

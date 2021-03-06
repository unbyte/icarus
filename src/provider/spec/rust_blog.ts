import { CardMsgHeaderTemplate } from '../../bot/msg.ts'
import { AtomOption, useAtom } from '../common/atom.ts'

export const useRustBlog = (options?: AtomOption) => {
  return useAtom([{
    url: 'https://blog.rust-lang.org/feed.xml',
    name: 'Rust Blog',
    theme: CardMsgHeaderTemplate.GREY,
  }, {
    url: 'https://blog.rust-lang.org/inside-rust/feed.xml',
    name: 'Inside Rust Blog',
    theme: CardMsgHeaderTemplate.GREY,
  }], options)
}

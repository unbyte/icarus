import { CardMsgHeaderTemplate } from '../../bot/msg.ts'
import { CooperpressOption, useCooperpress } from '../common/cooperpress.ts'

export const useCooperpressPublications = (options?: CooperpressOption) => {
  return useCooperpress([{
    url: 'https://cprss.s3.amazonaws.com/frontendfoc.us.xml',
    name: 'Frontend Focus Weekly',
    theme: CardMsgHeaderTemplate.YELLOW,
  }, {
    url: 'https://cprss.s3.amazonaws.com/javascriptweekly.com.xml',
    name: 'Javascript Weekly',
    theme: CardMsgHeaderTemplate.YELLOW,
  }, {
    url: 'https://cprss.s3.amazonaws.com/golangweekly.com.xml',
    name: 'Golang Weekly',
    theme: CardMsgHeaderTemplate.WATHET,
  }, {
    url: 'https://cprss.s3.amazonaws.com/nodeweekly.com.xml',
    name: 'Nodejs Weekly',
    theme: CardMsgHeaderTemplate.GREEN,
  }, {
    url: 'https://cprss.s3.amazonaws.com/dbweekly.com.xml',
    name: 'Database Weekly',
    theme: CardMsgHeaderTemplate.BLUE,
  }, {
    url: 'https://cprss.s3.amazonaws.com/weekly.statuscode.com.xml',
    name: 'Dev Weekly',
    theme: CardMsgHeaderTemplate.YELLOW,
  }], options)
}

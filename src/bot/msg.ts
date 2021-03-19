export enum I18N {
  ZH_CN = 'zh_cn',
  EN_US = 'en_us',
  JA_JP = 'ja_jp',
}

export enum MessageType {
  PLAIN = 'text',
  RICH = 'post',
  CARD = 'interactive',
}

export enum TextType {
  PLAIN = 'plain_text',
  MD = 'lark_md',
}

export type Message = PlainMsg | RichTextMsg | CardMsg

// plain text message: https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM
export interface PlainMsg {
  msg_type: MessageType.PLAIN
  content: {
    text: string
  }
}

// rich text message: https://open.feishu.cn/document/ukTMukTMukTM/uMDMxEjLzATMx4yMwETM
export interface RichTextMsg {
  msg_type: MessageType.RICH
  content: {
    post: Record<I18N, RichTextMsgElement[]>
  }
}

export enum RichTextMsgElementType {
  A = 'a',
  TEXT = 'text',
  AT = 'at',
  IMG = 'img',
}

export type RichTextMsgElement =
  | RichTextMsgElementA
  | RichTextMsgElementAt
  | RichTextMsgElementText
  | RichTextMsgElementImg

export interface RichTextMsgElementA {
  tag: RichTextMsgElementType.A
  text: string
  un_escape?: boolean
  href: string
}

export interface RichTextMsgElementText {
  tag: RichTextMsgElementType.TEXT
  text: string
  un_escape?: boolean
}

export interface RichTextMsgElementAt {
  tag: RichTextMsgElementType.AT
  user_id: string
}

export interface RichTextMsgElementImg {
  tag: RichTextMsgElementType.IMG
  image_key: string
  height?: number
  width?: number
}

// card message: https://open.feishu.cn/document/ukTMukTMukTM/ugTNwUjL4UDM14CO1ATN
export interface CardMsg {
  msg_type: MessageType.CARD
  update_multi?: boolean
  card: {
    config?: CardMsgConfig
    header?: CardMsgHeader
    elements?: CardMsgModule[]
    i18n_elements?: CardMsgModule[]
    card_link?: CardMsgObjUrl
  }
}

// https://open.feishu.cn/document/ukTMukTMukTM/uAjNwUjLwYDM14CM2ATN
export interface CardMsgConfig {
  enable_forward?: boolean
  wide_screen_mode?: boolean
}

export enum CardMsgHeaderTemplate {
  BLUE = 'Blue',
  WATHET = 'Wathet',
  TURQUOISE = 'Turquoise',
  GREEN = 'Green',
  YELLOW = 'Yellow',
  ORANGE = 'Orange',
  RED = 'Red',
  CARMINE = 'Carmine',
  VIOLET = 'Violet',
  PURPLE = 'Purple',
  INDIGO = 'Indigo',
  GREY = 'Grey',
}

// https://open.feishu.cn/document/ukTMukTMukTM/ukTNwUjL5UDM14SO1ATN
export interface CardMsgHeader {
  title: {
    tag: TextType.PLAIN
    i18n?: Record<I18N, string>
    lines?: number
  } | CardMsgObjText
  template?: CardMsgHeaderTemplate
}

// https://open.feishu.cn/document/ukTMukTMukTM/uUzNwUjL1cDM14SN3ATN
export interface CardMsgObjText {
  tag: TextType
  content: string
  // only when tag === TextType.PLAIN
  lines?: number
}

// https://open.feishu.cn/document/ukTMukTMukTM/uYzNwUjL2cDM14iN3ATN
export interface CardMsgObjField {
  is_short: boolean
  text: CardMsgObjText
}

// https://open.feishu.cn/document/ukTMukTMukTM/uczNwUjL3cDM14yN3ATN
export interface CardMsgObjUrl {
  url: string
  android_url: string
  ios_url: string
  pc_url: string
}

// https://open.feishu.cn/document/ukTMukTMukTM/ugzNwUjL4cDM14CO3ATN
export interface CardMsgObjOption {
  text?: CardMsgObjText
  value: string
  url?: string
  multi_url?: CardMsgObjUrl
}

// https://open.feishu.cn/document/ukTMukTMukTM/ukzNwUjL5cDM14SO3ATN
export interface CardMsgObjConfirm {
  title: CardMsgObjText
  text: CardMsgObjText
}

export type CardMsgModule =
  | CardMsgModuleContent
  | CardMsgModuleDivider
  | CardMsgModuleImg
  | CardMsgModuleAction
  | CardMsgModuleNote

export enum CardMsgModuleType {
  CONTENT = 'div',
  DIVIDER = 'hr',
  IMG = 'img',
  ACTION = 'action',
  NOTE = 'note',
  MD = 'markdown',
}

// https://open.feishu.cn/document/ukTMukTMukTM/uMjNwUjLzYDM14yM2ATN
export interface CardMsgModuleContent {
  tag: CardMsgModuleType.CONTENT
  text?: CardMsgObjText
  fields?: CardMsgObjField[]
  extra?: CardMsgElement
}

// https://open.feishu.cn/document/ukTMukTMukTM/uQjNwUjL0YDM14CN2ATN
export interface CardMsgModuleDivider {
  tag: CardMsgModuleType.DIVIDER
}

// https://open.feishu.cn/document/ukTMukTMukTM/uUjNwUjL1YDM14SN2ATN
export interface CardMsgModuleImg {
  tag: CardMsgModuleType.IMG
  img_key: string
  alt: CardMsgObjText
  title?: CardMsgObjText
  preview?: boolean
  mode?: 'fit_horizontal' | 'crop_center'
}

// https://open.feishu.cn/document/ukTMukTMukTM/uYjNwUjL2YDM14iN2ATN
export interface CardMsgModuleAction {
  tag: CardMsgModuleType.ACTION
  actions: CardMsgElement[]
}

// https://open.feishu.cn/document/ukTMukTMukTM/ucjNwUjL3YDM14yN2ATN
export interface CardMsgModuleNote {
  tag: CardMsgModuleType.NOTE
  elements: (CardMsgObjText | CardMsgElementImg)[]
}

// https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN
export interface CardMsgModuleMD {
  tag: CardMsgModuleType.MD
  content: string
  href?: {
    urlVal: CardMsgObjUrl
  }
}

export type CardMsgElement =
  | CardMsgElementImg
  | CardMsgElementOverflow
  | CardMsgElementSelect
  | CardMsgElementPersonSelect
  | CardMsgElementButton
  | CardMsgElementTimePicker
  | CardMsgElementDatePicker
  | CardMsgElementDateTimePicker

export enum CardMsgElementType {
  IMG = 'img',
  OVERFLOW = 'overflow',
  BUTTON = 'button',
  DATE_PICKER = 'date_picker',
  TIME_PICKER = 'picker_time',
  DATETIME_PICKER = 'picker_datetime',
  SELECT_PERSION = 'select_person',
  SELECT_STATIC = 'select_static',
}

// https://open.feishu.cn/document/ukTMukTMukTM/uAzNwUjLwcDM14CM3ATN
export interface CardMsgElementImg {
  tag: CardMsgElementType.IMG
  img_key: string
  alt: CardMsgObjText
  preview?: boolean
}

// https://open.feishu.cn/document/ukTMukTMukTM/uMzNwUjLzcDM14yM3ATN
export interface CardMsgElementOverflow {
  tag: CardMsgElementType.OVERFLOW
  options: CardMsgObjOption[]
  value?: any
  confirm?: CardMsgObjConfirm
}

// https://open.feishu.cn/document/ukTMukTMukTM/uEzNwUjLxcDM14SM3ATN
export interface CardMsgElementButton {
  tag: CardMsgElementType.BUTTON
  text: CardMsgObjText
  url?: string
  multi_url?: CardMsgObjUrl
  type?: 'default' | 'primary' | 'danger'
  value?: any
  confirm?: CardMsgObjConfirm
}

interface CardMsgElementPicker {
  // format YYYY-MM-DD
  initial_date?: string
  placeholder?: string
  value?: any
  confirm?: CardMsgObjConfirm
}

// https://open.feishu.cn/document/ukTMukTMukTM/uQzNwUjL0cDM14CN3ATN
export interface CardMsgElementDatePicker extends CardMsgElementPicker {
  tag: CardMsgElementType.DATE_PICKER
}

// https://open.feishu.cn/document/ukTMukTMukTM/uQzNwUjL0cDM14CN3ATN
export interface CardMsgElementTimePicker extends CardMsgElementPicker {
  tag: CardMsgElementType.TIME_PICKER
}

// https://open.feishu.cn/document/ukTMukTMukTM/uQzNwUjL0cDM14CN3ATN
export interface CardMsgElementDateTimePicker extends CardMsgElementPicker {
  tag: CardMsgElementType.DATETIME_PICKER
}

// https://open.feishu.cn/document/ukTMukTMukTM/uIzNwUjLycDM14iM3ATN
interface CardMsgElementSelector {
  placeholder?: CardMsgObjText
  initial_option?: string
  options?: CardMsgObjOption[]
  value?: any
  confirm?: CardMsgObjConfirm
}

export interface CardMsgElementPersonSelect extends CardMsgElementSelector {
  tag: CardMsgElementType.SELECT_PERSION
}

export interface CardMsgElementSelect extends CardMsgElementSelector {
  tag: CardMsgElementType.SELECT_STATIC
}

/**
 *  message creators
 * */

export function createPlainMessage(text: string): PlainMsg {
  return {
    msg_type: MessageType.PLAIN,
    content: { text },
  }
}

export function createRichMessage(
  content: RichTextMsg['content']['post'],
): RichTextMsg {
  return {
    msg_type: MessageType.RICH,
    content: { post: content },
  }
}

export function createCardMessage(
  card: CardMsg['card'],
  update_multi: boolean = false,
): CardMsg {
  return {
    msg_type: MessageType.CARD,
    card,
    update_multi,
  }
}

/*
*   Module Creators
* */

export function useModuleContent(
  options: Pick<CardMsgModuleContent, 'extra' | 'text' | 'fields'>,
): CardMsgModuleContent {
  return {
    tag: CardMsgModuleType.CONTENT,
    ...options,
  }
}

export function useModuleDivider(): CardMsgModuleDivider {
  return { tag: CardMsgModuleType.DIVIDER }
}

export function useModuleImg(
  img_key: CardMsgModuleImg['img_key'],
  alt: CardMsgModuleImg['alt'],
  options: Pick<CardMsgModuleImg, 'preview' | 'mode' | 'title'>,
): CardMsgModuleImg {
  return {
    tag: CardMsgModuleType.IMG,
    img_key,
    alt,
    ...options,
  }
}

export function useModuleAction(
  actions: CardMsgModuleAction['actions'],
): CardMsgModuleAction {
  return {
    tag: CardMsgModuleType.ACTION,
    actions,
  }
}

export function useModuleNote(
  elements: CardMsgModuleNote['elements'],
): CardMsgModuleNote {
  return {
    tag: CardMsgModuleType.NOTE,
    elements,
  }
}

export function useModuleMD(
  content: CardMsgModuleMD['content'],
  url?: CardMsgObjUrl,
): CardMsgModuleMD {
  if (url) {
    return { tag: CardMsgModuleType.MD, content, href: { urlVal: url } }
  }
  return { tag: CardMsgModuleType.MD, content }
}

/*
*   Element Creators
* */

export function useImg(
  img_key: CardMsgElementImg['img_key'],
  alt: CardMsgElementImg['alt'],
  preview: CardMsgElementImg['preview'],
): CardMsgElementImg {
  return {
    tag: CardMsgElementType.IMG,
    img_key,
    alt,
    preview,
  }
}

export function useOverflow(
  items: CardMsgElementOverflow['options'],
  options: Pick<CardMsgElementOverflow, 'value' | 'confirm'>,
): CardMsgElementOverflow {
  return {
    tag: CardMsgElementType.OVERFLOW,
    options: items,
    ...options,
  }
}

export function usePersonSelect(
  options: Omit<CardMsgElementPersonSelect, 'tag'>,
): CardMsgElementPersonSelect {
  return {
    tag: CardMsgElementType.SELECT_PERSION,
    ...options,
  }
}

export function useSelect(
  options: Omit<CardMsgElementSelect, 'tag'>,
): CardMsgElementSelect {
  return {
    tag: CardMsgElementType.SELECT_STATIC,
    ...options,
  }
}

export function useButton(
  text: CardMsgElementButton['text'],
  options: Omit<CardMsgElementButton, 'tag' | 'text'>,
): CardMsgElementButton {
  return {
    tag: CardMsgElementType.BUTTON,
    text,
    ...options,
  }
}

export function useTimePicker(
  options: Omit<CardMsgElementTimePicker, 'tag'>,
): CardMsgElementTimePicker {
  return {
    tag: CardMsgElementType.TIME_PICKER,
    ...options,
  }
}

export function useDatePicker(
  options: Omit<CardMsgElementDatePicker, 'tag'>,
): CardMsgElementDatePicker {
  return {
    tag: CardMsgElementType.DATE_PICKER,
    ...options,
  }
}

export function useDateTimePicker(
  options: Omit<CardMsgElementDateTimePicker, 'tag'>,
): CardMsgElementDateTimePicker {
  return {
    tag: CardMsgElementType.DATETIME_PICKER,
    ...options,
  }
}

/*
*   Obj Creators
* */

export function useText(content: string, lines: number = 1): CardMsgObjText {
  return {
    tag: TextType.PLAIN,
    content,
    lines,
  }
}

export function useMDText(content: string): CardMsgObjText {
  return {
    tag: TextType.MD,
    content,
  }
}

export function useField(
  text: CardMsgObjText,
  allowParallel: boolean = false,
): CardMsgObjField {
  return {
    text,
    is_short: allowParallel,
  }
}

export function useUrl(
  url: string,
  override: Partial<Omit<CardMsgObjUrl, 'url'>>,
): CardMsgObjUrl {
  return {
    url,
    android_url: url,
    ios_url: url,
    pc_url: url,
    ...override,
  }
}

export function useOption(
  value: string,
  options: Omit<CardMsgObjOption, 'value'>,
): CardMsgObjOption {
  return {
    value,
    ...options,
  }
}

export function useConfirm(
  title: CardMsgObjText,
  text: CardMsgObjText,
): CardMsgObjConfirm {
  return { title, text }
}

/*
*   Message Template
* */

export function getCardMessage_Header_Body(
  headerColor: CardMsgHeaderTemplate,
  headerTitle: string,
  body: CardMsgModule[],
): CardMsg {
  return createCardMessage({
    header: {
      template: headerColor,
      title: useText(headerTitle) as any,
    },
    elements: body,
  })
}

import { url } from "~/constant"

export const humanCase = (str: string) => str
  .split('_')
  .join(' ')

export const firstCap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const nbsp = '\xa0'
export const minus = '−'
export const getToggleLabel = (show: boolean, label: string) =>
  (show ? minus : '+') + ( label ? ' ' + label : '' )

export const getUrl = (path: string) => url.scheme + '://' + url.host + ':' + url.port + path;

export const genCode = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex]
  }
  return code
}

export const getPercent = (x: number) => Math.round(x * 100) + '%'

// Format date for display as "YYYY-MM-DD"
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}


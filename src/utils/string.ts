import { url } from "~/constant"

export const humanCase = (str: string) => str
  .split('_')
  .join(' ')

export const firstCap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const nbsp = '\xa0'

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

export const buildUrl = (route: string, params?: Record<string, any>) => {
  // Rewrite link
  if (route === 'show-record') {
    if (params?.tableName === 'statement') {
      route = 'statement'
      params = { id: params.id }
    } else if (params?.tableName === 'argument') {
      route = 'statement'
      params = { argumentId: params.id }
    }
  }

  let url = '/' + route
  if (params) {
    url += '?' + Object.entries(params)
      .map(([k, v]) => k + '=' + v)
      .join('&')
  }
  return url
}

// Format date for display as "YYYY-MM-DD"
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}


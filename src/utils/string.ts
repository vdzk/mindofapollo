export const humanCase = (str: string) => str
  .split('_')
  .join(' ')

export const firstCap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const nbsp = '\xa0'
export const minus = '−'
export const getToggleLabel = (show: boolean, label: string) =>
  (show ? '▴' : '▾') + ( label ? ' ' + label : '' )

export const genCode = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex]
  }
  return code
}

export const getPercent = (x?: number) => typeof x === 'number'
  ? Math.round(x * 100) + '%'
  : '?'

export const getShortNumber = (value: number): string => {
  const abs = Math.abs(value)

  const format = (num: number, suffix: string) =>
    `${parseFloat(num.toFixed(1))}${suffix}`

  if (abs < 1_000) return value.toString()
  if (abs < 1_000_000) return format(value / 1_000, 'k')
  if (abs < 1_000_000_000) return format(value / 1_000_000, 'M')
  if (abs < 1_000_000_000_000) return format(value / 1_000_000_000, 'B')

  return format(value / 1_000_000_000_000, 'T')
}


export const truncate = (str: string, maxLength: number) => 
  str.length > maxLength
    ? str.slice(0, maxLength - 1) + '…'
    : str

// Format date for display as "YYYY-MM-DD"
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}


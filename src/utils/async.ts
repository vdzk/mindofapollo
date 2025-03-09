
export const resolveEntries = async <T>(entries: [string, Promise<T>][]) => Object.fromEntries(
  await Promise.all(
    entries.map(
      async ([key, promise]) => [key, await promise]
    )
  )
) as Record<string, T>

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


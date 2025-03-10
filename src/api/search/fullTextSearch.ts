import { onError, sql } from "~/server-only/db"
import { getUserLanguage } from "~/server-only/session"
import {  langSettings } from "~/translation"

export interface SearchResult {
  table_name: string;
  column_name: string;
  record_id: number;
  matched_text: string;
}

export const fullTextSearch = async (query: string): Promise<SearchResult[]> => {
  "use server"

  if (!query || query.trim() === '') {
    return []
  }

  // Get user's language from session and provide a fallback
  const language = await getUserLanguage()

  // Ensure we have a valid language setting
  if (!language) {
    return []
  }

  // Sanitized query string
  const searchQuery = query.trim()

  // Format the search query with :* suffix for prefix matching
  const formattedSearchQuery = searchQuery.split(' ').join(' & ') + ':*'

  // Create search query with language-specific configuration
  let results: SearchResult[] | undefined

  const langSetting = langSettings[language]

  // Build the WHERE clause based on language indexing type
  const whereClause = langSetting?.indexType === 'groonga'
    ? sql`${sql(language)} &@~ ${searchQuery}`
    : sql`to_tsvector(${language}::regconfig, ${sql(language)}) @@ 
         to_tsquery(${language}::regconfig, ${formattedSearchQuery})`

  // For non-groonga languages, we can use ts_headline to extract relevant text
  if (langSetting?.indexType !== 'groonga') {
    results = await sql<SearchResult[]>`
      SELECT 
        table_name, 
        column_name, 
        record_id, 
        ts_headline(
          ${language}::regconfig, 
          ${sql(language)},
          to_tsquery(${language}::regconfig, ${formattedSearchQuery}),
          'MaxFragments=1, MaxWords=20, MinWords=10, FragmentDelimiter=...'
        ) as matched_text
      FROM 
        translation
      WHERE 
        ${whereClause}
      LIMIT 20
    `.catch(onError)
  } else {
    // For groonga engine, keep the existing query
    results = await sql<SearchResult[]>`
      SELECT 
        table_name, 
        column_name, 
        record_id, 
        ${sql(language)} as matched_text
      FROM 
        translation
      WHERE 
        ${whereClause}
      LIMIT 20
    `.catch(onError)
  }

  // Process results - only needed for groonga where we don't have ts_headline
  if (!results) return []

  if (langSetting?.indexType === 'groonga') {
    // Extract search terms without special characters for highlighting
    const searchTerms = searchQuery.split(' ').filter(term => term.length > 0)
    
    return results.map(result => {
      if (!result.matched_text) return { ...result, matched_text: '' }
      
      const text = result.matched_text
      
      // Find the position of the first matching term
      let matchPosition = -1
      for (const term of searchTerms) {
        const pos = text.toLowerCase().indexOf(term.toLowerCase())
        if (pos !== -1 && (matchPosition === -1 || pos < matchPosition)) {
          matchPosition = pos
        }
      }
      
      // If no match is found, just truncate from the beginning
      if (matchPosition === -1) {
        return {
          ...result,
          matched_text: text.length > 100 ? text.substring(0, 97) + '...' : text
        }
      }
      
      // Extract context around the match
      const contextSize = 50 // Characters on each side of the match
      let start = Math.max(0, matchPosition - contextSize)
      let end = Math.min(text.length, matchPosition + contextSize)
      
      // Add ellipsis indicators if we're not showing the full text
      const prefix = start > 0 ? '...' : ''
      const suffix = end < text.length ? '...' : ''
      
      return {
        ...result,
        matched_text: `${prefix}${text.substring(start, end)}${suffix}`
      }
    })
  }
  
  return results
}
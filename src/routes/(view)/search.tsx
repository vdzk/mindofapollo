import { Component, For, Show } from "solid-js"
import { Title } from "@solidjs/meta"
import { query, useSearchParams } from "@solidjs/router"
import { fullTextSearch } from "~/api/search/fullTextSearch"
import type { SearchResult } from "~/api/search/fullTextSearch"
import { createResource } from "solid-js"
import { Link } from "~/components/Link"
import { humanCase } from "~/utils/string"
import { parseBoldTags } from "~/utils/formatters"

// Create the query directly in the component file, similar to how it's done in other components
const searchTextQuery = query(
  (searchTerm: string) => fullTextSearch(searchTerm),
  'searchTextQuery'
)

const SearchPage: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Use createResource instead of createAsync with the query
  const [searchResults] = createResource(
    () => searchParams.q, 
    (term) => term ? searchTextQuery(term as string) : Promise.resolve([])
  )

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const query = formData.get("query") as string
    
    if (query && query.trim() !== "") {
      setSearchParams({ q: query })
    }
  }

  return (
    <>
      <Title>Search{searchParams.q ? `: ${searchParams.q}` : ""}</Title>
      <div class="container mx-auto p-2">
        <h1 class="text-2xl font-bold mb-4">Search</h1>
        
        <form onSubmit={handleSearch} class="mb-2">
          <div class="flex gap-2">
            <input 
              type="text" 
              name="query"
              value={searchParams.q || ""}
              placeholder="Search..." 
              class="flex-1 p-2 border rounded-md"
            />
            <button 
              type="submit" 
              class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Search
            </button>
          </div>
        </form>
      </div>
        
        <Show
          when={searchParams.q}
          fallback={
            <div class="p-2">
              <p class="text-gray-500">Enter your search query above to find records.</p>
            </div>
          }
        >
          <div class="mb-2">
            <Show
              when={!searchResults.loading}
              fallback={<div class="p-4">Searching...</div>}
            >
              <p class="text-sm text-gray-500 px-2">
                Found {searchResults()?.length || 0} results for "{searchParams.q}"
              </p>
            </Show>
          </div>

          <Show
            when={searchResults() && searchResults()?.length}
            fallback={
              <Show when={searchResults() !== undefined && searchParams.q}>
                <div class="p-4 border rounded-md bg-gray-50">
                  <p class="text-gray-500">No results found for "{searchParams.q}"</p>
                </div>
              </Show>
            }
          >
              <For each={searchResults() || []}>
                {(result: SearchResult) => {                  
                  return (
                    <div class="px-2 pb-2 ">
                      <div class="text-gray-500">{`${humanCase(result.table_name)} ${humanCase(result.column_name)}`}</div>
                      <Link 
                        route="show-record"
                        params={{ tableName: result.table_name, id: result.record_id }}
                        label={parseBoldTags(result.matched_text)}
                      />
                    </div>
                  )
                }}
              </For>
          </Show>
        </Show>
    </>
  )
}

export default SearchPage

import { Component, createSignal, For, Show, createMemo, onMount, onCleanup } from "solid-js"
import { Option } from "~/types"

interface LongSelectProps {
  options: Option<number>[]
  value?: number
  name: string
  onChange: (id: number) => void
  placeholder?: string
  class?: string
}

export const LongSelect: Component<LongSelectProps> = (props) => {
  const [dropdownOpen, setDropdownOpen] = createSignal(false)
  const [filterText, setFilterText] = createSignal("")
  let containerRef: HTMLDivElement | undefined
  
  const filteredOptions = createMemo(() => {
    if (!filterText()) return props.options
    
    const searchText = filterText().toLowerCase()
    return props.options.filter(option => 
      String(option.label)
        .toLowerCase()
        .includes(searchText)
    )
  })
  
  const selectedLabel = createMemo(() => {
    if (!props.value) return ""
    const option = props.options.find(opt => opt.id === props.value)
    return option ? option.label : ""
  })
  
  const handleSelect = (id: number) => {
    props.onChange(id)
    setDropdownOpen(false)
    setFilterText("")
  }
  
  const handleInputChange = (e: InputEvent & { currentTarget: HTMLInputElement, target: Element }) => {
    setFilterText(e.currentTarget.value)
  }
  
  const handleInputKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    if (e.key === "Escape") {
      setDropdownOpen(false)
    } else if (e.key === "ArrowDown") {
      setDropdownOpen(true)
      // Focus the first item in the dropdown
      setTimeout(() => {
        const firstItem = document.querySelector(".dropdown-item") as HTMLElement
        if (firstItem) firstItem.focus()
      }, 10)
      e.preventDefault()
    }
  }
  
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      setDropdownOpen(false)
    }
  }
  
  const handleInputFocus = () => {
    setDropdownOpen(true)
    setFilterText("")
  }
  
  const handleDropdownBlur = (e: FocusEvent & { currentTarget: HTMLDivElement }) => {
    // Close dropdown when focus leaves the component, except when clicking items
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && !e.currentTarget.contains(relatedTarget)) {
      setDropdownOpen(false)
    }
  }
  
  const handleDropdownItemClick = (option: Option<number>) => () => {
    handleSelect(option.id)
  }
  
  const handleDropdownItemKeyDown = (option: Option<number>) => (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    if (e.key === "Enter" || e.key === " ") {
      handleSelect(option.id)
      e.preventDefault()
    } else if (e.key === "ArrowDown") {
      (e.currentTarget.nextElementSibling as HTMLElement)?.focus()
      e.preventDefault()
    } else if (e.key === "ArrowUp") {
      (e.currentTarget.previousElementSibling as HTMLElement)?.focus()
      e.preventDefault()
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside)
  })
  
  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  return (
    <div class={`relative ${props.class || ''}`} ref={containerRef}>
      <input
        type="text"
        name={props.name}
        class="border rounded pl-1 w-full"
        placeholder={props.placeholder}
        value={dropdownOpen() ? filterText() : selectedLabel()}
        onFocus={handleInputFocus}
        onInput={handleInputChange}
        onKeyDown={handleInputKeyDown}
        autocomplete="off"
      />
      <Show when={dropdownOpen()}>
        <div 
          class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          tabIndex={-1}
          onBlur={handleDropdownBlur}
        >
          <Show when={filteredOptions().length === 0}>
            <div class="px-4 py-2 text-gray-500">No matches found</div>
          </Show>
          <For each={filteredOptions()}>
            {option => (
              <div 
                class="dropdown-item px-4 py-2 cursor-pointer hover:bg-blue-100 focus:bg-blue-100 focus:outline-none"
                classList={{ "bg-blue-200": option.id === props.value }}
                onClick={handleDropdownItemClick(option)}
                onKeyDown={handleDropdownItemKeyDown(option)}
                tabIndex={0}
              >
                {option.label}
              </div>
            )}
          </For>
        </div>
      </Show>
      <input type="hidden" name={props.name} value={props.value || ''} />
    </div>
  )
}
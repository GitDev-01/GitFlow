'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Search, ChevronDown, Check } from 'lucide-react'
import { FlowNodeData } from '@/types/flow'

interface Item {
  id: string
  name: string
}

export interface MultiSelect {
  items: Item[], 
  saveValues: (id: string, data: Partial<FlowNodeData>) => void, 
  nodeId: string,
  label: string
  values: string[] // values already in node data i.e. selected by the user before
}

export function MultiSelect({items, saveValues, nodeId, label, values}: MultiSelect) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const saveSelectedItems = useCallback((values: string[]) => {
    saveValues(nodeId, {[label]: values})
  }, [saveValues, nodeId, label])

  const filtered = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const toggleItem = (item: string) => {
    const exists = values.find((i) => i === item)
    saveSelectedItems( exists ? values.filter((i) => i !== item) : [...values, item])
  }

  const removeItem = useCallback((itemName: string) => {
    saveSelectedItems(values.filter((i) => i !== itemName))
  }, [values, saveSelectedItems])

  const clearAll = useCallback(() => saveSelectedItems([]), [saveSelectedItems])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  const count = values.length

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto font-sans">
      <div className="mb-2 flex items-center justify-between">
        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Trigger / Chip display area */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full min-h-11 px-3 py-2 bg-background border border-border rounded-lg text-left flex items-start gap-2 hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Scrollable chip area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {count > 0 ? (
            <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
              {values.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-medium shrink-0"
                >
                  {item}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${item}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        removeItem(item)
                      }
                    }}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground leading-7">
              Search and select items...
            </span>
          )}
        </div>

        {/* Count badge + chevron */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          {count > 0 && (
            <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5 leading-none tabular-nums">
              {count}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-1.5 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 relative">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No items match &quot;{query}&quot;
              </li>
            ) : (
              filtered.map((item, index) => {
                const isSelected = values.some((i) => i === item.name)
                return (
                  <li
                    key={index}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleItem(item.name)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors
                      ${isSelected
                        ? 'bg-primary/8 text-foreground'
                        : 'text-foreground hover:bg-accent'
                      }`}
                  >
                    <span>{item.name}</span>
                    {isSelected && (
                      <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                    )}
                  </li>
                )
              })
            )}
          </ul>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
            {count > 0 && (
              <span className="text-xs text-muted-foreground">
                {count} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

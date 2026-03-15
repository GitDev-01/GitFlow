'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Search, ChevronDown, Check } from 'lucide-react'
import { FlowNodeData } from '@/types/flow'

interface Item {
  id: string
  name: string
}

interface SelectedItem extends Item {
  alias: string
}

export interface MultiSelectWithAlias {
  items: Item[], 
  saveValues: (id: string, data: Partial<FlowNodeData>) => void, 
  nodeId: string, 
  label: string
  values: SelectedItem[] // values already in node data i.e. selected by the user before
}

export function MultiSelectWithAlias({items, saveValues, nodeId, label, values }: MultiSelectWithAlias) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const saveSelectedValues = (selectedValues: SelectedItem[]) => {
    const inputFormat = selectedValues.map((item)=>({from: item.name, as: item.alias }))
    saveValues(nodeId, {[label]: inputFormat})
  }

  const filtered = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const toggleItem = useCallback((item: Item) => {
    const exists = values.find((i) => i.name === item.name)

    saveSelectedValues(exists
        ? values.filter((i) => i.name !== item.name)
        : [...values, { ...item, alias: '' }]
    )
  }, [values, saveSelectedValues])

  const removeItem = useCallback((itemName: string) => {
    saveSelectedValues(values.filter((i) => i.name !== itemName))
  }, [values, saveSelectedValues])

  const updateAlias = useCallback((itemName: string, alias: string) => {
    saveSelectedValues(values.map((i) => (i.name === itemName ? { ...i, alias } : i)))
  }, [values, saveSelectedValues])

  const clearAll = useCallback(() => saveSelectedValues([]), [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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

      {/* Label row */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {count > 0 && (
            <span className="ml-2 text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5 tabular-nums">
              {count}
            </span>
          )}
        </label>
        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full h-10 px-3 bg-background border border-border rounded-lg text-left flex items-center justify-between gap-2 hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm text-muted-foreground">
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''} selected` : 'Search and select items...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-1.5 bg-background border border-border rounded-lg shadow-lg overflow-hidden relative z-50">
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
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
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
              filtered.map((item) => {
                const isSelected = values.some((i) => i.name === item.name)
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleItem(item)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors
                      ${isSelected ? 'bg-primary/8 text-foreground' : 'text-foreground hover:bg-accent'}`}
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

      {/* Selected items with alias inputs */}
      {count > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {values.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 px-3 py-2.5 bg-background border border-border rounded-lg"
            >
              <div className="flex-1 flex flex-col gap-2" style={{width: "10px"}}>
                {/* Item name */}
                <div className="flex items-center justify-between">
                  <span  className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </span>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.name)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Alias input */}
                <input
                  type="text"
                  value={item.alias}
                  onChange={(e) => updateAlias(item.name, e.target.value)}
                  placeholder="Enter alias..."
                  aria-label={`Alias for ${item.name}`}
                  className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground border border-border rounded px-2 py-1"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Search, ChevronDown, Check } from 'lucide-react'
import { MultiSelect } from './MultiSelect'

interface Item {
  id: string
  name: string
}

interface SelectedItem extends Item {
  alias: string
}

const AVAILABLE_ITEMS: Item[] = [
  { id: '1',  name: 'Wireless Headphones' },
  { id: '2',  name: 'USB-C Cable' },
  { id: '3',  name: 'Phone Case' },
  { id: '4',  name: 'Screen Protector' },
  { id: '5',  name: 'Portable Charger' },
  { id: '6',  name: 'Desk Mount' },
  { id: '7',  name: 'Mechanical Keyboard' },
  { id: '8',  name: 'Mouse Pad' },
  { id: '9',  name: 'Webcam' },
  { id: '10', name: 'LED Desk Lamp' },
  { id: '11', name: 'Monitor Stand' },
  { id: '12', name: 'Cable Organizer' },
  { id: '13', name: 'Laptop Sleeve' },
  { id: '14', name: 'USB Hub' },
  { id: '15', name: 'Wireless Mouse' },
  { id: '16', name: 'HDMI Adapter' },
  { id: '17', name: 'Notebook' },
  { id: '18', name: 'Sticky Notes' },
  { id: '19', name: 'Ballpoint Pen Set' },
  { id: '20', name: 'Desk Organizer' },
  { id: '21', name: 'Wrist Rest' },
  { id: '22', name: 'Laptop Stand' },
  { id: '23', name: 'Thermal Paste' },
  { id: '24', name: 'Compressed Air Can' },
  { id: '25', name: 'Microfiber Cloth' },
  { id: '26', name: 'Screen Cleaner' },
  { id: '27', name: 'Cable Clips' },
  { id: '28', name: 'Velcro Straps' },
  { id: '29', name: 'Power Strip' },
  { id: '30', name: 'Surge Protector' },
  { id: '31', name: 'Ethernet Cable' },
  { id: '32', name: 'Network Switch' },
  { id: '33', name: 'Wi-Fi Extender' },
  { id: '34', name: 'Smart Plug' },
  { id: '35', name: 'Bluetooth Speaker' },
  { id: '36', name: 'Earbuds' },
  { id: '37', name: 'Microphone' },
  { id: '38', name: 'Headphone Stand' },
  { id: '39', name: 'Soundbar' },
  { id: '40', name: 'Drawing Tablet' },
  { id: '41', name: 'SD Card' },
  { id: '42', name: 'Card Reader' },
  { id: '43', name: 'External SSD' },
  { id: '44', name: 'Flash Drive' },
  { id: '45', name: 'Portable HDD' },
  { id: '46', name: 'Privacy Screen' },
  { id: '47', name: 'Anti-Glare Film' },
  { id: '48', name: 'Chair Cushion' },
  { id: '49', name: 'Footrest' },
  { id: '50', name: 'Monitor Light Bar' },
]

export function MultiSelectWithAlias({items, saveItems, nodeId, label }: MultiSelect) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const toggleItem = useCallback((item: Item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      return exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, { ...item, alias: '' }]
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId))
  }, [])

  const updateAlias = useCallback((itemId: string, alias: string) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, alias } : i))
    )
  }, [])

  const clearAll = useCallback(() => setSelectedItems([]), [])

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

  const count = selectedItems.length

  useEffect(()=>{
    const inputFormat = selectedItems.map((item)=>{
        if (item.name.includes("-")){
            const arr = item.name.split(" - ")
            let formatedNameString = ""

            if (item.name.includes("Convesation")){
                formatedNameString = (arr[1].replace(" ", "_").toLocaleLowerCase()+":"+arr[0])

            } else {
                formatedNameString = ("context:"+arr[0]+"."+arr[1].replace(" ", "_").toLocaleLowerCase()) 
            }

            return {from: formatedNameString, as: item.alias }
        } else {
            return {from: item.name.replace(" ", "_").toLocaleLowerCase(), as: item.alias}
        }
    })

    saveItems(nodeId, {[label]: inputFormat})
    
  }, [selectedItems])

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
                const isSelected = selectedItems.some((i) => i.id === item.id)
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
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 px-3 py-2.5 bg-background border border-border rounded-lg"
            >
              <div className="flex-1 flex flex-col gap-2">
                {/* Item name */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </span>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
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
                  onChange={(e) => updateAlias(item.id, e.target.value)}
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

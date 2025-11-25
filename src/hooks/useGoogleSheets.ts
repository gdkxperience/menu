import { useState, useEffect, useCallback } from 'react'
import type { MenuItem } from '@/types/menu'

const CACHE_KEY = 'restaurant_menu_cache'
const CACHE_TIMESTAMP_KEY = 'restaurant_menu_cache_timestamp'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 24 hours in milliseconds

interface CacheData {
  items: MenuItem[]
  timestamp: number
}

interface UseGoogleSheetsResult {
  data: MenuItem[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refetch: () => Promise<void>
}

// Parse Google Sheets data into MenuItem format
function parseSheetData(rows: string[][]): MenuItem[] {
  // First row is headers: name, description, price, category, image, tags, isAvailable
  const headers = rows[0]?.map(h => h.toLowerCase().trim()) ?? []
  
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const priceIdx = headers.indexOf('price')
  const categoryIdx = headers.indexOf('category')
  const imageIdx = headers.indexOf('image')
  const tagsIdx = headers.indexOf('tags')
  const availableIdx = headers.indexOf('isavailable')

  return rows.slice(1).map((row, index) => ({
    id: `item-${index}`,
    name: row[nameIdx] ?? '',
    description: row[descIdx] ?? '',
    price: parseFloat(row[priceIdx] ?? '0') || 0,
    category: row[categoryIdx] ?? 'Other',
    image: row[imageIdx] ?? undefined,
    tags: row[tagsIdx] ? row[tagsIdx].split(',').map(t => t.trim()).filter(Boolean) : undefined,
    isAvailable: row[availableIdx]?.toLowerCase() !== 'false' && row[availableIdx]?.toLowerCase() !== 'no',
  })).filter(item => item.name) // Filter out empty rows
}

function getCachedData(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    
    if (cached && timestamp) {
      const ts = parseInt(timestamp, 10)
      const now = Date.now()
      
      // Check if cache is still valid (within 24 hours)
      if (now - ts < CACHE_DURATION) {
        return {
          items: JSON.parse(cached),
          timestamp: ts,
        }
      }
    }
  } catch {
    // Cache read failed, return null
  }
  return null
}

function setCachedData(items: MenuItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // Cache write failed, ignore
  }
}

export function useGoogleSheets(sheetId: string, sheetName = 'Sheet1'): UseGoogleSheetsResult {
  const [data, setData] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (skipCache = false) => {
    // Check cache first (unless skipping)
    if (!skipCache) {
      const cached = getCachedData()
      if (cached) {
        setData(cached.items)
        setLastUpdated(new Date(cached.timestamp))
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Google Sheets public CSV export URL
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Неуспешно зареждане на данните от менюто')
      }

      const text = await response.text()
      
      // Google returns JSONP-like response, extract the JSON
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/)
      
      if (!jsonMatch) {
        throw new Error('Невалиден формат на отговора от Google Sheets')
      }

      const json = JSON.parse(jsonMatch[1])
      
      // Extract rows from the response
      const rows: string[][] = []
      
      // Get headers from cols
      if (json.table?.cols) {
        const headerRow = json.table.cols.map((col: { label?: string }) => col.label || '')
        rows.push(headerRow)
      }
      
      // Get data rows
      if (json.table?.rows) {
        for (const row of json.table.rows) {
          const rowData = row.c?.map((cell: { v?: string | number | null; f?: string } | null) => {
            if (cell === null) return ''
            return cell.f ?? cell.v?.toString() ?? ''
          }) ?? []
          rows.push(rowData)
        }
      }

      const items = parseSheetData(rows)
      setData(items)
      setCachedData(items)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешно зареждане на менюто')
      
      // Try to use cached data as fallback
      const cached = getCachedData()
      if (cached) {
        setData(cached.items)
        setLastUpdated(new Date(cached.timestamp))
      }
    } finally {
      setLoading(false)
    }
  }, [sheetId, sheetName])

  useEffect(() => {
    fetchData()

    // Set up 24-hour refresh interval
    const interval = setInterval(() => {
      fetchData(true) // Skip cache on scheduled refresh
    }, CACHE_DURATION)

    return () => clearInterval(interval)
  }, [fetchData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return { data, loading, error, lastUpdated, refetch }
}


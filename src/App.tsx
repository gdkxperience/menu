import { useMemo, useState, useEffect } from 'react'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { MenuCard } from '@/components/MenuCard'
import { MenuSkeleton } from '@/components/MenuSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { MenuItem } from '@/types/menu'

// Replace with your Google Sheets ID
// The sheet should be published to web (File > Share > Publish to web)
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || ''
const SHEET_NAME = import.meta.env.VITE_GOOGLE_SHEET_NAME || 'Sheet1'

// Demo data for when no Google Sheet is configured
const DEMO_ITEMS: MenuItem[] = [
  { id: '1', name: 'Бурата с трюфели', description: 'Кремообразна бурата с черни трюфели, домати по стар рецепт и редуциран балсамов оцет', price: 18.00, category: 'Предястия', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop', tags: ['вегетарианско', 'избор на шефа'], isAvailable: true },
  { id: '2', name: 'Хрупкави калмари', description: 'Леко пържени калмари с лимонов айоли и сос маринара', price: 14.00, category: 'Предястия', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', tags: ['морски дарове'], isAvailable: true },
  { id: '3', name: 'Френска лучена супа', description: 'Карамелизиран лук в богат телешки бульон, покрит с крутон с грюер', price: 12.00, category: 'Предястия', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', tags: ['класика'], isAvailable: true },
  { id: '4', name: 'Рибай на скара', description: '400г отлежал рибай с билково масло, картофено пюре с печен чесън и сезонни зеленчуци', price: 48.00, category: 'Основни', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop', tags: ['фирмено', 'без глутен'], isAvailable: true },
  { id: '5', name: 'Сьомга на тиган', description: 'Атлантическа сьомга с цитрусова глазура, киноа пилаф и печени аспержи', price: 32.00, category: 'Основни', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', tags: ['морски дарове', 'здравословно'], isAvailable: true },
  { id: '6', name: 'Ризото с диви гъби', description: 'Ориз арборио с манатарки, шийтаке и стриди гъби, завършено с трюфелово масло', price: 26.00, category: 'Основни', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', tags: ['вегетарианско'], isAvailable: true },
  { id: '7', name: 'Лингуини с омар', description: 'Пресен омар с чери домати, чесън и маслен сос с бяло вино', price: 42.00, category: 'Основни', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', tags: ['морски дарове', 'избор на шефа'], isAvailable: false },
  { id: '8', name: 'Тирамису', description: 'Класически италиански десерт с бишкоти, напоени с еспресо, и крем маскарпоне', price: 12.00, category: 'Десерти', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', tags: ['класика'], isAvailable: true },
  { id: '9', name: 'Крем брюле', description: 'Ванилов крем с карамелизирана захарна коричка', price: 10.00, category: 'Десерти', image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400&h=300&fit=crop', tags: ['без глутен'], isAvailable: true },
  { id: '10', name: 'Шоколадов фондан', description: 'Топла шоколадова торта с течен център, поднесена с ванилов сладолед', price: 14.00, category: 'Десерти', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', tags: ['изкушение'], isAvailable: true },
  { id: '11', name: 'Еспресо мартини', description: 'Водка, прясно еспресо, кафеен ликьор и ванилия', price: 16.00, category: 'Напитки', tags: ['коктейл'], isAvailable: true },
  { id: '12', name: 'Фирмена сангрия', description: 'Домашно червено вино с пресни сезонни плодове и капка бренди', price: 12.00, category: 'Напитки', tags: ['вино'], isAvailable: true },
]

const USE_DEMO = !SHEET_ID

function App() {
  const sheetsResult = useGoogleSheets(SHEET_ID || 'placeholder', SHEET_NAME)
  
  // Use demo data if no sheet ID configured
  const [demoLoading, setDemoLoading] = useState(USE_DEMO)
  
  useEffect(() => {
    if (USE_DEMO) {
      const timer = setTimeout(() => setDemoLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [])
  
  const data = USE_DEMO ? DEMO_ITEMS : sheetsResult.data
  const loading = USE_DEMO ? demoLoading : sheetsResult.loading
  const error = USE_DEMO ? null : sheetsResult.error
  const lastUpdated = USE_DEMO ? new Date() : sheetsResult.lastUpdated
  const refetch = USE_DEMO ? async () => {} : sheetsResult.refetch

  // Group items by category
  const categories = useMemo(() => {
    const categoryMap = new Map<string, typeof data>()
    
    for (const item of data) {
      const existing = categoryMap.get(item.category) || []
      categoryMap.set(item.category, [...existing, item])
    }
    
    return Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items,
    }))
  }, [data])

  const defaultCategory = categories[0]?.name || ''

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/5 via-accent/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-primary/10 to-transparent blur-3xl" />
      </div>

      {/* Demo mode banner */}
      {USE_DEMO && (
        <div className="bg-primary/10 border-b border-primary/20 py-2 text-center text-sm">
          <span className="text-primary font-medium">Демо режим</span>
          <span className="text-muted-foreground"> — Конфигурирайте вашия Google Sheet ID в </span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env</code>
          <span className="text-muted-foreground"> за да покажете вашето меню</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Нашето меню
            </h1>
            <p className="text-muted-foreground max-w-md">
              Пресни съставки, грижливо приготвени ястия, незабравими вкусове
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Error state */}
        {error && (
          <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-destructive/80 underline underline-offset-2 hover:text-destructive transition-colors"
            >
              Опитайте отново
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && data.length === 0 && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-24 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            </div>
            <MenuSkeleton count={6} />
          </div>
        )}

        {/* Menu content */}
        {!loading && categories.length > 0 && (
          <Tabs defaultValue={defaultCategory} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1.5">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.name}
                    value={category.name}
                    className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-60">
                      ({category.items.length})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item, index) => (
                    <MenuCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4 text-6xl">🍽️</div>
            <h2 className="font-display text-2xl font-semibold mb-2">Все още няма ястия в менюто</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Добавете ястия към вашия Google Sheet, за да се показват тук. Уверете се, че листът е публикуван в интернет.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Меню на ресторанта</p>
            {lastUpdated && (
              <p className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Последна актуализация: {lastUpdated.toLocaleString('bg-BG')}
                <button
                  onClick={() => refetch()}
                  className="ml-2 underline underline-offset-2 hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Обновяване...' : 'Обнови'}
                </button>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

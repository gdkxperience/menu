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
  { id: '1', name: 'Truffle Burrata', description: 'Creamy burrata with black truffle, heirloom tomatoes, and aged balsamic reduction', price: 18.00, category: 'Starters', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop', tags: ['vegetarian', 'chef\'s pick'], isAvailable: true },
  { id: '2', name: 'Crispy Calamari', description: 'Lightly fried calamari with lemon aioli and marinara sauce', price: 14.00, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', tags: ['seafood'], isAvailable: true },
  { id: '3', name: 'French Onion Soup', description: 'Caramelized onions in rich beef broth topped with gruyère crouton', price: 12.00, category: 'Starters', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', tags: ['classic'], isAvailable: true },
  { id: '4', name: 'Grilled Ribeye', description: '14oz prime ribeye with herb butter, roasted garlic mashed potatoes, and seasonal vegetables', price: 48.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop', tags: ['signature', 'gluten-free'], isAvailable: true },
  { id: '5', name: 'Pan-Seared Salmon', description: 'Atlantic salmon with citrus glaze, quinoa pilaf, and grilled asparagus', price: 32.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', tags: ['seafood', 'healthy'], isAvailable: true },
  { id: '6', name: 'Wild Mushroom Risotto', description: 'Arborio rice with porcini, shiitake, and oyster mushrooms finished with truffle oil', price: 26.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', tags: ['vegetarian'], isAvailable: true },
  { id: '7', name: 'Lobster Linguine', description: 'Fresh Maine lobster with cherry tomatoes, garlic, and white wine butter sauce', price: 42.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', tags: ['seafood', 'chef\'s pick'], isAvailable: false },
  { id: '8', name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream', price: 12.00, category: 'Desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', tags: ['classic'], isAvailable: true },
  { id: '9', name: 'Crème Brûlée', description: 'Vanilla bean custard with caramelized sugar crust', price: 10.00, category: 'Desserts', image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400&h=300&fit=crop', tags: ['gluten-free'], isAvailable: true },
  { id: '10', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center, served with vanilla gelato', price: 14.00, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', tags: ['indulgent'], isAvailable: true },
  { id: '11', name: 'Espresso Martini', description: 'Vodka, fresh espresso, coffee liqueur, and vanilla', price: 16.00, category: 'Drinks', tags: ['cocktail'], isAvailable: true },
  { id: '12', name: 'Signature Sangria', description: 'House red wine with fresh seasonal fruits and a splash of brandy', price: 12.00, category: 'Drinks', tags: ['wine'], isAvailable: true },
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
          <span className="text-primary font-medium">Demo Mode</span>
          <span className="text-muted-foreground"> — Configure your Google Sheet ID in </span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env</code>
          <span className="text-muted-foreground"> to show your menu</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Our Menu
            </h1>
            <p className="text-muted-foreground max-w-md">
              Fresh ingredients, carefully crafted dishes, unforgettable flavors
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
              Try again
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
            <h2 className="font-display text-2xl font-semibold mb-2">No menu items yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Add items to your Google Sheet to see them appear here. Make sure the sheet is published to the web.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Restaurant Menu</p>
            {lastUpdated && (
              <p className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Last updated: {lastUpdated.toLocaleString()}
                <button
                  onClick={() => refetch()}
                  className="ml-2 underline underline-offset-2 hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
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

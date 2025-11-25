import type { MenuItem } from '@/types/menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MenuCardProps {
  item: MenuItem
  index: number
}

export function MenuCard({ item, index }: MenuCardProps) {
  return (
    <Card 
      className={cn(
        "group overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        "opacity-0 animate-slide-up",
        !item.isAvailable && "opacity-60"
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      {item.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Badge variant="secondary" className="text-sm">
                Временно не се предлага
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className={cn("pb-2", item.image && "pt-4")}>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-display text-xl leading-tight">
            {item.name}
          </CardTitle>
          <span className="shrink-0 font-display text-xl font-semibold text-primary">
            {item.price.toFixed(2)} лв.
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs font-normal text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


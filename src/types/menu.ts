export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  tags?: string[]
  isAvailable: boolean
}

export interface MenuCategory {
  name: string
  items: MenuItem[]
}


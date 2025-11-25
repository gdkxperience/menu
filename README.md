# Restaurant Menu

A beautiful restaurant menu app that fetches items from a Google Sheet and displays them with a modern, responsive UI.

Built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 📊 **Google Sheets Integration** - Manage your menu in a simple spreadsheet
- 🔄 **Auto-caching** - Caches menu data for 24 hours with automatic refresh
- 📱 **Responsive Design** - Looks great on mobile, tablet, and desktop
- 🎨 **Beautiful UI** - Warm color scheme with elegant typography
- ⚡ **Fast Loading** - Skeleton loading states for smooth UX
- 🏷️ **Categories & Tags** - Organize items with categories and tags

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your Google Sheet

Create a Google Sheet with the following columns in the first row:

| name | description | price | category | image | tags | isAvailable |
|------|-------------|-------|----------|-------|------|-------------|
| Margherita Pizza | Fresh tomatoes, mozzarella, basil | 14.99 | Pizzas | https://... | vegetarian, classic | true |
| Caesar Salad | Romaine, parmesan, croutons | 9.99 | Salads | https://... | healthy | true |

### 3. Publish your Google Sheet

1. Open your Google Sheet
2. Go to **File > Share > Publish to web**
3. Select "Entire Document" and "Web page"
4. Click **Publish**

### 4. Configure the app

Get your Sheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

Create a `.env` file in the project root:
```env
VITE_GOOGLE_SHEET_ID=your_google_sheet_id_here
VITE_GOOGLE_SHEET_NAME=Sheet1
```

Or edit the `SHEET_ID` constant directly in `src/App.tsx`.

### 5. Run the app

```bash
npm run dev
```

## Google Sheet Columns

| Column | Required | Description |
|--------|----------|-------------|
| name | Yes | Item name |
| description | No | Item description |
| price | Yes | Price (number, e.g., 12.99) |
| category | No | Category for grouping (e.g., "Appetizers", "Mains") |
| image | No | Image URL |
| tags | No | Comma-separated tags (e.g., "vegetarian, spicy") |
| isAvailable | No | "true"/"false" or "yes"/"no" (default: true) |

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

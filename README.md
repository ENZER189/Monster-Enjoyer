# MonsterVault

A small Next.js app for tracking a Monster Energy can collection.

## Features

- Add/edit/delete cans
- Gallery view
- Table view
- Wishlist view
- Rarity score
- Collection value stats
- Google Images / Search / Official links
- Import/export JSON backup
- Stores data locally in the browser for MVP

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Create a GitHub repository called `monster-vault`.
2. Upload this project folder to the repository.
3. Go to Vercel → Add New Project.
4. Import the GitHub repository.
5. Keep default settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click Deploy.

## Important

This MVP uses browser `localStorage`, so each visitor's collection stays only in their browser. Use Export JSON to back up the collection.

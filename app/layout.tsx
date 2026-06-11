import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MonsterVault — Energy Drink Collection Tracker',
  description: 'Track your Monster Energy collection, wishlist, rarity and gallery.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

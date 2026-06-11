export type CanStatus = 'Owned' | 'Want' | 'Ordered' | 'Duplicate' | 'Sold / Traded';
export type CanRarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';

export type MonsterCan = {
  id: string;
  name: string;
  flavor: string;
  series: string;
  country: string;
  year: string;
  volume: string;
  status: CanStatus;
  rarity: CanRarity;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  whereBought: string;
  rating: number;
  imageUrl: string;
  officialUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const STATUSES: CanStatus[] = ['Owned', 'Want', 'Ordered', 'Duplicate', 'Sold / Traded'];
export const RARITIES: CanRarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

export const rarityScore: Record<CanRarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 5,
  'Very Rare': 10,
  Legendary: 25
};

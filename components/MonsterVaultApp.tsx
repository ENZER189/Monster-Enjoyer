'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { exportCans, loadCans, makeId, saveCans } from '@/lib/storage';
import { CanRarity, CanStatus, MonsterCan, RARITIES, rarityScore, STATUSES } from '@/lib/types';

const sampleCans: MonsterCan[] = [
  {
    id: 'sample-1',
    name: 'Monster Energy Original',
    flavor: 'Classic Energy',
    series: 'Original',
    country: 'USA',
    year: '2002',
    volume: '500 ml',
    status: 'Owned',
    rarity: 'Common',
    quantity: 1,
    purchasePrice: 2.5,
    currentValue: 3,
    whereBought: 'Local store',
    rating: 5,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Monster_Energy_drink_black_can.jpg/320px-Monster_Energy_drink_black_can.jpg',
    officialUrl: 'https://www.monsterenergy.com/',
    notes: 'Classic black and green can. Good first item for the vault.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    name: 'Monster Ultra White',
    flavor: 'Zero Sugar Citrus',
    series: 'Ultra',
    country: 'USA',
    year: '',
    volume: '500 ml',
    status: 'Want',
    rarity: 'Uncommon',
    quantity: 0,
    purchasePrice: 0,
    currentValue: 4,
    whereBought: '',
    rating: 4,
    imageUrl: '',
    officialUrl: '',
    notes: 'Need a clean front photo for the gallery.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const emptyForm = {
  name: '',
  flavor: '',
  series: 'Original',
  country: '',
  year: '',
  volume: '500 ml',
  status: 'Owned' as CanStatus,
  rarity: 'Common' as CanRarity,
  quantity: 1,
  purchasePrice: 0,
  currentValue: 0,
  whereBought: '',
  rating: 3,
  imageUrl: '',
  officialUrl: '',
  notes: ''
};

type ViewMode = 'gallery' | 'table' | 'wishlist';

export default function MonsterVaultApp() {
  const [cans, setCans] = useState<MonsterCan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('gallery');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CanStatus>('All');

  useEffect(() => {
    setCans(loadCans());
  }, []);

  useEffect(() => {
    saveCans(cans);
  }, [cans]);

  const filtered = useMemo(() => {
    return cans.filter((can) => {
      const text = `${can.name} ${can.flavor} ${can.series} ${can.country} ${can.notes}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || can.status === statusFilter;
      const matchesView = view !== 'wishlist' || can.status === 'Want';
      return matchesQuery && matchesStatus && matchesView;
    });
  }, [cans, query, statusFilter, view]);

  const stats = useMemo(() => {
    const totalWithDuplicates = cans.reduce((sum, can) => sum + Number(can.quantity || 0), 0);
    const value = cans.reduce((sum, can) => sum + Number(can.currentValue || 0) * Math.max(1, Number(can.quantity || 0)), 0);
    const purchase = cans.reduce((sum, can) => sum + Number(can.purchasePrice || 0) * Math.max(1, Number(can.quantity || 0)), 0);
    const rare = cans.filter((can) => ['Rare', 'Very Rare', 'Legendary'].includes(can.rarity)).length;
    const score = cans.reduce((sum, can) => sum + rarityScore[can.rarity], 0);
    return {
      unique: cans.length,
      totalWithDuplicates,
      wishlist: cans.filter((can) => can.status === 'Want').length,
      rare,
      value,
      purchase,
      score
    };
  }, [cans]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const numberFields = ['quantity', 'purchasePrice', 'currentValue', 'rating'];
    setForm((prev) => ({ ...prev, [name]: numberFields.includes(name) ? Number(value) : value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const now = new Date().toISOString();

    if (editingId) {
      setCans((prev) => prev.map((can) => can.id === editingId ? { ...can, ...form, updatedAt: now } : can));
      setEditingId(null);
    } else {
      setCans((prev) => [{ id: makeId(), ...form, createdAt: now, updatedAt: now }, ...prev]);
    }

    setForm(emptyForm);
  }

  function editCan(can: MonsterCan) {
    setEditingId(can.id);
    setForm({
      name: can.name,
      flavor: can.flavor,
      series: can.series,
      country: can.country,
      year: can.year,
      volume: can.volume,
      status: can.status,
      rarity: can.rarity,
      quantity: can.quantity,
      purchasePrice: can.purchasePrice,
      currentValue: can.currentValue,
      whereBought: can.whereBought,
      rating: can.rating,
      imageUrl: can.imageUrl,
      officialUrl: can.officialUrl,
      notes: can.notes
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeCan(id: string) {
    const ok = window.confirm('Delete this can from your vault?');
    if (!ok) return;
    setCans((prev) => prev.filter((can) => can.id !== id));
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error('Not an array');
        setCans(parsed);
      } catch {
        alert('Could not import this file. Use JSON exported from MonsterVault.');
      }
    };
    reader.readAsText(file);
  }

  function loadDemo() {
    if (cans.length > 0 && !window.confirm('Add demo cans to your current collection?')) return;
    setCans((prev) => [...sampleCans, ...prev]);
  }

  return (
    <main className="min-h-screen monster-grid px-4 py-6 sm:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-monster/20 bg-black/50 p-6 shadow-2xl sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-monster">MonsterVault</p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Energy can collection tracker</h1>
            <p className="mt-3 max-w-2xl text-white/65">Save cans, images, wishlist, rarity, value and fast search links. This MVP stores data in your browser. Use Export to back it up.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadDemo} className="rounded-full bg-monster px-4 py-2 text-sm font-black text-black hover:brightness-110">Load demo</button>
            <button onClick={() => exportCans(cans)} className="rounded-full border border-monster/40 px-4 py-2 text-sm font-bold text-monster hover:bg-monster/10">Export JSON</button>
            <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10">
              Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={importJson} />
            </label>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          <Stat label="Unique" value={stats.unique} />
          <Stat label="Total cans" value={stats.totalWithDuplicates} />
          <Stat label="Wishlist" value={stats.wishlist} />
          <Stat label="Rare+" value={stats.rare} />
          <Stat label="Rarity score" value={stats.score} />
          <Stat label="Value" value={`$${stats.value.toFixed(2)}`} />
          <Stat label="Profit diff" value={`$${(stats.value - stats.purchase).toFixed(2)}`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="glass h-fit rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">{editingId ? 'Edit can' : 'Add can'}</h2>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-sm text-white/60 hover:text-white">Cancel</button>}
            </div>

            <div className="grid gap-3">
              <Input label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Monster Ultra White" required />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Flavor" name="flavor" value={form.flavor} onChange={handleChange} placeholder="Citrus / Mango / Peach" />
                <Input label="Series" name="series" value={form.series} onChange={handleChange} placeholder="Ultra / Juiced / Java" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Country" name="country" value={form.country} onChange={handleChange} placeholder="USA" />
                <Input label="Year" name="year" value={form.year} onChange={handleChange} placeholder="2024" />
                <Input label="Volume" name="volume" value={form.volume} onChange={handleChange} placeholder="500 ml" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Status" name="status" value={form.status} onChange={handleChange} options={STATUSES} />
                <Select label="Rarity" name="rarity" value={form.rarity} onChange={handleChange} options={RARITIES} />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Input label="Qty" type="number" name="quantity" value={form.quantity} onChange={handleChange} />
                <Input label="Paid $" type="number" step="0.01" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} />
                <Input label="Value $" type="number" step="0.01" name="currentValue" value={form.currentValue} onChange={handleChange} />
                <Input label="Rating" type="number" min="1" max="5" name="rating" value={form.rating} onChange={handleChange} />
              </div>
              <Input label="Where bought" name="whereBought" value={form.whereBought} onChange={handleChange} placeholder="Store / city / website" />
              <Input label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://...jpg / png / webp" />
              <Input label="Official page URL" name="officialUrl" value={form.officialUrl} onChange={handleChange} placeholder="https://monsterenergy.com/..." />
              <label className="text-sm font-bold text-white/70">
                Notes
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/25 focus:border-monster/70" placeholder="Condition, story, trade notes..." />
              </label>
              <button className="mt-2 rounded-2xl bg-monster px-5 py-3 font-black text-black hover:brightness-110">{editingId ? 'Save changes' : 'Add to vault'}</button>
            </div>
          </form>

          <section className="glass rounded-3xl p-5">
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                <Tab active={view === 'gallery'} onClick={() => setView('gallery')}>Gallery</Tab>
                <Tab active={view === 'table'} onClick={() => setView('table')}>Table</Tab>
                <Tab active={view === 'wishlist'} onClick={() => setView('wishlist')}>Wishlist</Tab>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search collection..." className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/35 focus:border-monster/70" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | CanStatus)} className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-monster/70">
                  <option value="All">All statuses</option>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/55">No cans yet. Add your first Monster can or load demo data.</div>
            ) : view === 'table' ? (
              <CollectionTable cans={filtered} onEdit={editCan} onDelete={removeCan} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((can) => <CanCard key={can.id} can={can} onEdit={editCan} onDelete={removeCan} />)}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="glass rounded-3xl p-4"><p className="text-xs font-bold uppercase tracking-widest text-white/45">{label}</p><p className="mt-1 text-2xl font-black text-monster">{value}</p></div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return <label className="text-sm font-bold text-white/70">{label}<input {...inputProps} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/25 focus:border-monster/70" /></label>;
}

function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) {
  return <label className="text-sm font-bold text-white/70">{label}<select {...props} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-monster/70">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black ${active ? 'bg-monster text-black' : 'border border-white/10 text-white/70 hover:bg-white/10'}`}>{children}</button>;
}

function CanCard({ can, onEdit, onDelete }: { can: MonsterCan; onEdit: (can: MonsterCan) => void; onDelete: (id: string) => void }) {
  const imageSearch = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${can.name} Monster Energy can`)}`;
  const webSearch = `https://www.google.com/search?q=${encodeURIComponent(`${can.name} Monster Energy can`)}`;
  const officialSearch = can.officialUrl || `https://www.monsterenergy.com/search/?q=${encodeURIComponent(can.name)}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/35">
      <div className="flex h-56 items-center justify-center bg-white/[0.03] p-4">
        {can.imageUrl ? <img src={can.imageUrl} alt={can.name} className="max-h-full max-w-full rounded-2xl object-contain" /> : <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-white/35">No image yet</div>}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">{can.name}</h3>
            <p className="text-sm text-white/50">{can.series} / {can.country || 'Unknown country'} / {can.volume}</p>
          </div>
          <span className="rounded-full bg-monster/15 px-2 py-1 text-xs font-black text-monster">{can.rarity}</span>
        </div>
        <p className="text-sm text-white/60">{can.flavor || 'No flavor'} · {can.status} · Qty {can.quantity}</p>
        <p className="mt-2 text-sm text-white/45">Value: ${Number(can.currentValue || 0).toFixed(2)} · Score: {rarityScore[can.rarity]}</p>
        {can.notes && <p className="mt-3 line-clamp-2 text-sm text-white/55">{can.notes}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <a href={imageSearch} target="_blank" className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:bg-white/10">Images</a>
          <a href={webSearch} target="_blank" className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:bg-white/10">Search</a>
          <a href={officialSearch} target="_blank" className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:bg-white/10">Official</a>
          <button onClick={() => onEdit(can)} className="rounded-full border border-monster/30 px-3 py-1 text-monster hover:bg-monster/10">Edit</button>
          <button onClick={() => onDelete(can.id)} className="rounded-full border border-red-400/30 px-3 py-1 text-red-300 hover:bg-red-400/10">Delete</button>
        </div>
      </div>
    </article>
  );
}

function CollectionTable({ cans, onEdit, onDelete }: { cans: MonsterCan[]; onEdit: (can: MonsterCan) => void; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-[1000px] w-full text-left text-sm">
        <thead className="bg-black/60 text-xs uppercase tracking-wider text-monster">
          <tr>
            <th className="px-3 py-3">Can</th>
            <th className="px-3 py-3">Series</th>
            <th className="px-3 py-3">Country</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Rarity</th>
            <th className="px-3 py-3">Qty</th>
            <th className="px-3 py-3">Value</th>
            <th className="px-3 py-3">Links</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cans.map((can) => (
            <tr key={can.id} className="border-t border-white/10 text-white/70">
              <td className="px-3 py-3 font-bold text-white">{can.name}</td>
              <td className="px-3 py-3">{can.series}</td>
              <td className="px-3 py-3">{can.country}</td>
              <td className="px-3 py-3">{can.status}</td>
              <td className="px-3 py-3">{can.rarity}</td>
              <td className="px-3 py-3">{can.quantity}</td>
              <td className="px-3 py-3">${Number(can.currentValue || 0).toFixed(2)}</td>
              <td className="px-3 py-3"><a className="text-monster" target="_blank" href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${can.name} Monster Energy can`)}`}>Images</a></td>
              <td className="px-3 py-3"><button className="mr-3 text-monster" onClick={() => onEdit(can)}>Edit</button><button className="text-red-300" onClick={() => onDelete(can.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

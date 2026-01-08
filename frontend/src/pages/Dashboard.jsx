import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function Dashboard() {
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');
    const [cartCount, setCartCount] = useState(0);
    const [priceMax, setPriceMax] = useState(3000);
    const [durationFilter, setDurationFilter] = useState('Any duration');
    const [showAdd, setShowAdd] = useState(false);
    const [newPkg, setNewPkg] = useState({ title: '', destinationCountry: '', destinationCity: '', price: '', imageUrl: '', features: '', duration: '', date: '' });
    const [userPackages, setUserPackages] = useState([]);
    const [tagFilters, setTagFilters] = useState({});
    const ratePackage = (id, r) => {
      setUserPackages((u) => u.map((p) => {
        if (p._id !== id) return p
        const count = Number(p.ratingCount || 0)
        const avg = Number(p.ratingAvg || 0)
        const newAvg = (avg * count + r) / (count + 1)
        return { ...p, ratingAvg: newAvg, ratingCount: count + 1 }
      }))
    }

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const r = await fetch(`${API_BASE}/packages`)
          const j = await r.json()
          const rows = j && typeof j === 'object' && Array.isArray(j.data) ? j.data : []
          if (cancelled) return
          setUserPackages(
            rows.map((p) => ({
              ...(p && typeof p === 'object' ? p : {}),
              ratingAvg: Number(p?.ratingAvg || 0),
              ratingCount: Number(p?.ratingCount || 0),
            }))
          )
        } catch { void 0 }
      })()
      return () => { cancelled = true }
    }, [])

    // Demo tours data
    const [tours, setTours] = useState([
        {
            id: 1,
            title: 'Paris Adventure',
            location: 'Paris, France',
            price: 1200,
            date: '2024-06-15',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
            rating: 4.5,
            duration: '5 days',
            type: 'Cultural'
        },
        {
            id: 2,
            title: 'Tokyo Explorer',
            location: 'Tokyo, Japan',
            price: 1500,
            date: '2024-07-01',
            imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            rating: 4.8,
            duration: '7 days',
            type: 'Adventure'
        },
        {
            id: 3,
            title: 'Bali Retreat',
            location: 'Bali, Indonesia',
            price: 900,
            date: '2024-05-20',
            imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
            rating: 4.6,
            duration: '6 days',
            type: 'Beach'
        }
    ]);

    const BASE_TYPES = ['Adventure','Cultural','Beach']
    const dynamicTags = Array.from(new Set(
      userPackages.flatMap((p) => Array.isArray(p.features) ? p.features : [])
    ));
    const mergedTags = Array.from(new Set([...BASE_TYPES, ...dynamicTags]))

    const selectedFeatureTags = Object.entries(tagFilters).filter(([,v])=>!!v).map(([k])=>k);

    const filteredTours = tours.filter((t) => {
        const priceOk = t.price <= Number(priceMax || 0) || Number(priceMax || 0) === 0 ? true : t.price <= Number(priceMax);
        const days = parseInt(String(t.duration).replace(/[^0-9]/g, '')) || 0;
        let durationOk = true;
        if (durationFilter === '1-3 days') durationOk = days >= 1 && days <= 3;
        else if (durationFilter === '4-7 days') durationOk = days >= 4 && days <= 7;
        else if (durationFilter === '7+ days') durationOk = days >= 7;
        const tagOk = selectedFeatureTags.length === 0 ? true : selectedFeatureTags.includes(t.type);
        return priceOk && durationOk && tagOk;
    });

    const filteredPkgs = userPackages.filter((p)=>{
        const priceOk = Number(p.price||0) <= Number(priceMax||0) || Number(priceMax||0)===0 ? true : Number(p.price||0) <= Number(priceMax);
        const days = parseInt(String(p.duration||'').replace(/[^0-9]/g,'')) || 0;
        let durationOk = true;
        if (durationFilter === '1-3 days') durationOk = days >=1 && days <=3;
        else if (durationFilter === '4-7 days') durationOk = days >=4 && days <=7;
        else if (durationFilter === '7+ days') durationOk = days >=7;
        const tags = Array.isArray(p.features) ? p.features : [];
        const tagsOk = selectedFeatureTags.length===0 ? true : selectedFeatureTags.every((ft)=> tags.includes(ft));
        return priceOk && durationOk && tagsOk;
    });

  const sortedTours = [...filteredTours].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'price') {
            comparison = a.price - b.price;
        } else if (sortBy === 'location') {
            comparison = a.location.localeCompare(b.location);
        } else if (sortBy === 'date') {
            comparison = new Date(a.date) - new Date(b.date);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
  });

  const displayCards = [
    ...sortedTours.map((t) => ({
      kind: 'tour',
      id: t.id,
      title: t.title,
      imageUrl: t.imageUrl,
      price: t.price,
      city: t.location.split(',')[0] || '',
      country: (t.location.split(',')[1] || '').trim(),
      duration: t.duration,
      rating: t.rating,
    })),
    ...filteredPkgs.map((p) => ({
      kind: 'pkg',
      id: p._id,
      title: p.title,
      imageUrl: p.imageUrl,
      price: p.price,
      city: p.destinationCity,
      country: p.destinationCountry,
      features: Array.isArray(p.features) ? p.features : [],
      duration: p.duration || '',
      date: p.date || '',
      ratingAvg: p.ratingAvg || 0,
      ratingCount: p.ratingCount || 0,
    })),
  ].sort((a,b)=>{
    if (sortBy === 'price') return (a.price||0) - (b.price||0);
    if (sortBy === 'location') return String(a.city||'').localeCompare(String(b.city||''));
    if (sortBy === 'date') return new Date(a.date||0) - new Date(b.date||0);
    return 0;
  })

    return (
        <div className="relative min-h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1260')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/40" />
            {/* Top Navbar */}
            <nav className="hidden">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="text-xl font-bold text-slate-900">WanderGo</span>
                    </div>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="text-sm font-medium text-slate-900 hover:text-slate-700">Home</Link>
                        <Link to="/tours" className="text-sm font-medium text-slate-600 hover:text-slate-900">Tours</Link>
                        <Link to="/bookings" className="text-sm font-medium text-slate-600 hover:text-slate-900">My Bookings</Link>
                        <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900">Profile</Link>
                    </div>

                    {/* Cart */}
                    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
                        )}
                    </button>
                </div>
            </nav>

            <div className="relative max-w-10xl mx-auto px-9 flex items-start gap-10">
                {/* Left Sidebar */}
                <aside className="hidden lg:block w-60 bg-white/75 backdrop-blur-md border-r border-slate-200/60 p-4 rounded-xl h-fit">
                    <div className="space-y-6">
                        {/* Filters Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filters</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-1">Price Range</label>
                                        <input type="range" min="0" max="3000" value={priceMax} onChange={(e)=>setPriceMax(Number(e.target.value))} className="w-full" />
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>$0</span>
                                            <span>${priceMax}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 block mb-1">Duration</label>
                                        <select value={durationFilter} onChange={(e)=>setDurationFilter(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900/10">
                                            <option value="Any duration">Any duration</option>
                                            <option value="1-3 days">1-3 days</option>
                                            <option value="4-7 days">4-7 days</option>
                                            <option value="7+ days">7+ days</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 block mb-2">Tags</label>
                                        <div className="space-y-2">
                                          {mergedTags.map((tg)=> (
                                            <label key={tg} className="flex items-center text-sm text-slate-700">
                                              <input
                                                type="checkbox"
                                                checked={!!tagFilters[tg]}
                                                onChange={()=> setTagFilters((prev)=> ({ ...prev, [tg]: !prev[tg] }))}
                                                className="mr-2 rounded"
                                              />
                                              {tg}
                                            </label>
                                          ))}
                                        </div>
                                    </div>
                        </div>
                    </div>

                    

                        {/* Quick Links */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                <Link to="/wishlist" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Wishlist
                                </Link>
                                <Link to="/support" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Sort Options */}
                    <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 p-4 mb-6 flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900/10"
                        >
                            <option value="price">Price</option>
                            <option value="location">Location</option>
                            <option value="date">Date</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                        </button>
                        <span className="ml-auto text-sm text-slate-500">{tours.length} tours found</span>
                        <button onClick={() => setShowAdd(v=>!v)} className="ml-4 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Add package</button>
                    </div>

                    {showAdd && (
                      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input label="Title" name="title" value={newPkg.title} onChange={(e)=>setNewPkg({...newPkg, title:e.target.value})} />
                          <Input label="Country" name="destinationCountry" value={newPkg.destinationCountry} onChange={(e)=>setNewPkg({...newPkg, destinationCountry:e.target.value})} />
                          <Input label="City" name="destinationCity" value={newPkg.destinationCity} onChange={(e)=>setNewPkg({...newPkg, destinationCity:e.target.value})} />
                          <Input label="Price" name="price" type="number" value={newPkg.price} onChange={(e)=>setNewPkg({...newPkg, price:e.target.value})} />
                          <Input label="Image URL" name="imageUrl" value={newPkg.imageUrl} onChange={(e)=>setNewPkg({...newPkg, imageUrl:e.target.value})} />
                          <Input label="Features (comma)" name="features" value={newPkg.features} onChange={(e)=>setNewPkg({...newPkg, features:e.target.value})} />
                          <Input label="Duration (e.g. 5 days)" name="duration" value={newPkg.duration} onChange={(e)=>setNewPkg({...newPkg, duration:e.target.value})} />
                          <Input label="Start date" name="date" type="date" value={newPkg.date} onChange={(e)=>setNewPkg({...newPkg, date:e.target.value})} />
                          <div className="md:col-span-3 flex justify-end gap-3">
                            <button onClick={()=>setShowAdd(false)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
                            <button
                              onClick={async ()=>{
                                const body = {
                                  title: newPkg.title,
                                  destinationCountry: newPkg.destinationCountry,
                                  destinationCity: newPkg.destinationCity,
                                  price: Number(newPkg.price || 0),
                                  imageUrl: newPkg.imageUrl,
                                  features: String(newPkg.features||'').split(',').map(s=>s.trim()).filter(Boolean),
                                  duration: newPkg.duration,
                                  date: newPkg.date
                                }
                                try {
                                  const r = await fetch(`${API_BASE}/packages`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
                                  const j = await r.json()
                                  if (!r.ok) {
                                    alert((j && typeof j.message === 'string' && j.message) ? j.message : 'Failed to create package')
                                    return
                                  }
                                  const serverPkg = j && typeof j === 'object' ? j.data : null
                                  const pkgId = serverPkg && typeof serverPkg === 'object' && serverPkg._id ? serverPkg._id : Date.now()
                                  const created = { ...body, ...(serverPkg || {}), ratingAvg:0, ratingCount:0, _id: pkgId }
                                  setUserPackages(u=>[created, ...u])
                                  setShowAdd(false)
                                  setNewPkg({ title: '', destinationCountry: '', destinationCity: '', price: '', imageUrl: '', features: '', duration:'', date:'' })
                                } catch (e) { console.error(e) }
                              }}
                              className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm"
                            >Save</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cards Grid (tours + user packages) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {displayCards.map((card) => (
                        <div key={`${card.kind}-${card.id}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col md:h-[32rem]">
                          <div className="relative h-56 overflow-hidden">
                            {card.imageUrl ? (
                              <img src={card.imageUrl} alt={card.title} className="block w-full h-full object-cover transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full bg-slate-100" />
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  if (card.kind === 'pkg') {
                                    const r = await fetch(`${API_BASE}/packages/${card.id}`, { method: 'DELETE' })
                                    if (!r.ok) throw new Error('delete_failed')
                                  }
                                } catch (e) {
                                  console.error(e)
                                  if (card.kind === 'pkg') alert('Failed to delete package')
                                  return
                                }
                                if (card.kind === 'tour') {
                                  setTours((prev) => prev.filter((t) => t.id !== card.id))
                                } else {
                                  setUserPackages((u) => u.filter((p) => p._id !== card.id))
                                }
                              }}
                              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition"
                              title="Delete"
                            >
                              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-7 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-slate-500">{card.city}{card.country ? `, ${card.country}` : ''}</span>
                              {card.kind === 'tour' && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm font-medium text-slate-700">{card.rating}</span>
                                </div>
                              )}
                              {card.kind === 'pkg' && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm font-medium text-slate-700">{Math.round((card.ratingAvg||0)*10)/10}</span>
                                  <span className="text-xs text-slate-500">({card.ratingCount||0})</span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2 min-h-[3.25rem] leading-snug">{card.title}</h3>
                            {(card.kind === 'tour' || card.kind === 'pkg') && (
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {card.date ? new Date(card.date).toLocaleDateString() : new Date().toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {card.duration}
                                </span>
                              </div>
                            )}
                            {card.kind === 'pkg' && (
                              <div className="mb-3 flex flex-wrap gap-2 min-h-[2.25rem] max-h-[2.25rem] overflow-hidden">
                                {(card.features || []).map((f) => (
                                  <span key={f} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">{f}</span>
                                ))}
                              </div>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                              <div>
                                <span className="text-xs text-slate-500">From</span>
                                <p className="text-xl font-bold text-slate-900">${card.price}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {card.kind === 'pkg' && (
                                  <div className="flex items-center">
                                    {[1,2,3,4,5].map((n)=> (
                                      <button key={n} aria-label={`Rate ${n}`} onClick={()=>ratePackage(card.id, n)} className="p-1">
                                        <svg className={`w-5 h-5 ${n <= Math.round(card.ratingAvg||0) ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <button
                                  onClick={() => setCartCount(cartCount + 1)}
                                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;

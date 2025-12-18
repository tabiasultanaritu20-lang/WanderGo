import React, { useEffect, useMemo, useState } from 'react'
import Input from '../components/Input.jsx'

const API = 'http://localhost:8080/api/spots'

export default function SpotDirectory() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newSpot, setNewSpot] = useState({ name:'', country:'', city:'', category:'', tagString:'', description:'', lat:'', lng:'', photoUrl:'' })
  const [modalSpot, setModalSpot] = useState(null)

  const canSearch = useMemo(() => true, [])

  const load = async () => {
    if (!canSearch) return
    setLoading(true)
    setError('')
    try {
      const u = new URL(API)
      if (q) u.searchParams.set('q', q)
      if (country) u.searchParams.set('country', country)
      if (city) u.searchParams.set('city', city)
      if (category) u.searchParams.set('category', category)
      if (tag) u.searchParams.set('tag', tag)
      const r = await fetch(u.toString())
      const j = await r.json()
      setList(Array.isArray(j.data) ? j.data : [])
    } catch {
      setError('Failed to load spots')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const id = setTimeout(() => { load() }, 300)
    return () => clearTimeout(id)
  }, [q, country, city, category, tag])

  

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1260')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/40" />
      <div className="relative max-w-6xl mx-auto p-4 flex">
        <aside className="hidden lg:block w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/60 min-h-[calc(100vh-73px)] p-6 rounded-xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Search</h3>
              <div className="space-y-3">
                <Input label="Search" name="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
                <Input label="Country" name="country" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                <Input label="City" name="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="Category" name="category" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                <Input label="Tag" name="tag" placeholder="Tag" value={tag} onChange={(e) => setTag(e.target.value)} />
                <div className="flex justify-end">
                  <button onClick={()=>setShowAdd(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-300 mr-2 text-sm">Add spot</button>
                  <button disabled={loading} onClick={load} className={`px-3 py-2 rounded-lg text-sm ${loading ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'}`}>Search</button>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">Wishlist</a>
                <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">Support</a>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold">Tourist Spot Directory</h1>

        {showAdd && (
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Name" name="name" value={newSpot.name} onChange={(e)=>setNewSpot({...newSpot, name:e.target.value})} />
              <Input label="Country" name="country" value={newSpot.country} onChange={(e)=>setNewSpot({...newSpot, country:e.target.value})} />
              <Input label="City" name="city" value={newSpot.city} onChange={(e)=>setNewSpot({...newSpot, city:e.target.value})} />
              <Input label="Category" name="category" value={newSpot.category} onChange={(e)=>setNewSpot({...newSpot, category:e.target.value})} />
              <Input label="Tags (comma)" name="tags" value={newSpot.tagString} onChange={(e)=>setNewSpot({...newSpot, tagString:e.target.value})} />
              <Input label="Photo URL" name="photoUrl" value={newSpot.photoUrl} onChange={(e)=>setNewSpot({...newSpot, photoUrl:e.target.value})} />
              <Input label="Latitude" name="lat" type="number" value={newSpot.lat} onChange={(e)=>setNewSpot({...newSpot, lat:e.target.value})} />
              <Input label="Longitude" name="lng" type="number" value={newSpot.lng} onChange={(e)=>setNewSpot({...newSpot, lng:e.target.value})} />
              <div className="md:col-span-3">
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Description" value={newSpot.description} onChange={(e)=>setNewSpot({...newSpot, description:e.target.value})} />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <button onClick={()=>setShowAdd(false)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
                <button
                  onClick={async ()=>{
                    const body = {
                      name: newSpot.name,
                      country: newSpot.country,
                      city: newSpot.city,
                      category: newSpot.category,
                      tags: String(newSpot.tagString||'').split(',').map(s=>s.trim()).filter(Boolean),
                      description: newSpot.description,
                      photos: newSpot.photoUrl ? [newSpot.photoUrl] : [],
                      lat: newSpot.lat ? Number(newSpot.lat) : undefined,
                      lng: newSpot.lng ? Number(newSpot.lng) : undefined
                    }
                    try {
                      const r = await fetch(API, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
                      await r.json()
                      setShowAdd(false)
                      setNewSpot({ name:'', country:'', city:'', category:'', tagString:'', description:'', lat:'', lng:'', photoUrl:'' })
                      load()
                    } catch (e) { console.error(e) }
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm"
                >Save</button>
              </div>
            </div>
          </div>
        )}

        {loading && <p className="mt-4">Loading…</p>}
        {error && <p className="mt-4 text-rose-600">{error}</p>}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.map((s) => (
            <div key={s._id} onClick={()=>setModalSpot(s)} className="cursor-pointer bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl transform transition-transform hover:-translate-y-0.5">
              {s.photos && s.photos[0] && (
                <img src={s.photos[0]} alt={s.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  {typeof s.lat === 'number' && typeof s.lng === 'number' && (
                    <a className="text-sm text-slate-700 hover:underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}>Map</a>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600 truncate">{s.description}</p>
                <div className="mt-2 text-xs text-slate-500">{s.city}, {s.country} • {s.category}</div>
                {Array.isArray(s.tags) && s.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.tags.map((t)=> (
                      <button
                        key={t}
                        onClick={() => setTag((prev) => prev === t ? '' : t)}
                        className={`px-2 py-1 rounded text-xs border ${tag===t? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-200'} hover:bg-slate-200 transition`}
                        aria-label={`Filter by tag ${t}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </main>

        {modalSpot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setModalSpot(null)} />
            <div className="relative max-w-3xl w-[92%] md:w-[860px] rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-2 bg-slate-100">
                  {modalSpot.photos && modalSpot.photos[0] ? (
                    <img src={modalSpot.photos[0]} alt={modalSpot.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No image</div>
                  )}
                </div>
                <div className="md:col-span-3 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{modalSpot.name}</h3>
                      <div className="mt-1 text-xs text-slate-500">{modalSpot.city}, {modalSpot.country} • {modalSpot.category}</div>
                    </div>
                    <button onClick={()=>setModalSpot(null)} className="p-2 rounded-lg hover:bg-slate-100">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{modalSpot.description}</p>
                  {Array.isArray(modalSpot.tags) && modalSpot.tags.length>0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {modalSpot.tags.map((t)=> (
                        <span key={t} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                  {typeof modalSpot.lat === 'number' && typeof modalSpot.lng === 'number' && (
                    <a className="mt-4 inline-block text-sm text-slate-700 hover:underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${modalSpot.lat},${modalSpot.lng}`}>Open in Maps</a>
                  )}
                  <div className="mt-6 text-xs text-slate-500">Last updated just now</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

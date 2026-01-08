import React, { useCallback, useEffect, useMemo, useState } from "react"

const API_BASE = import.meta.env.VITE_API_BASE || "/api"

export default function EmergencyHub() {
  const [query, setQuery] = useState({ country: "BD", city: "Dhaka" })
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rating, setRating] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [userRate, setUserRate] = useState(5)
  const [adminRate, setAdminRate] = useState(5)
  const [adminKey, setAdminKey] = useState("")
  const [newContact, setNewContact] = useState({ type: "police", name: "", phone: "", address: "" })
  const [newAlert, setNewAlert] = useState({ severity: "low", description: "", start_date: "", end_date: "" })
  const [alerts, setAlerts] = useState([])

  const canSearch = useMemo(() => query.country.trim().length >= 2, [query.country])

  const typeMatch = (c, key) => {
    const t = (c?.type || "").toLowerCase()
    if (key === "fire") return t.includes("fire")
    return t === key
  }

  const section = (label, key, list) => (
    <section className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-4">
      <h2 className="text-lg font-medium">{label}</h2>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.length === 0 && (
          <div className="text-sm text-slate-500">No {label.toLowerCase()}</div>
        )}
        {list.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200/60 bg-white/70 backdrop-blur p-3">
            <div className="text-sm font-semibold">{c.name}</div>
            <div className="text-xs text-slate-600">{c.address || c.city}, {c.country}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{key}</span>
              <div className="flex items-center gap-2">
                <a href={`tel:${c.phone}`} className="text-sm font-medium text-slate-900">{c.phone}</a>
                <button
                  onClick={async()=>{try{const r=await fetch(`${API_BASE}/emergency-contacts/${c.id}`,{method:"DELETE"});if(r.ok){await load()}}catch{ void 0 }}}
                  className="text-xs px-2 py-1 rounded border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const load = useCallback(async () => {
    if (!canSearch) return
    setLoading(true)
    setError("")
    try {
      const p = new URLSearchParams()
      p.set("country", query.country)
      if (query.city) p.set("city", query.city)
      const r = await fetch(`${API_BASE}/emergency-contacts?${p.toString()}`)
      const j = await r.json()
      setContacts(Array.isArray(j.contacts) ? j.contacts : [])
    } catch {
      setError("Failed to load contacts")
    }
    try {
      const p2 = new URLSearchParams()
      p2.set("country", query.country)
      if (query.city) p2.set("city", query.city)
      const r2 = await fetch(`${API_BASE}/safety-rating?${p2.toString()}`)
      const j2 = await r2.json()
      setRating(j2)
    } catch {
      setRating(null)
    }
    try {
      const p3 = new URLSearchParams()
      p3.set("country", query.country)
      if (query.city) p3.set("city", query.city)
      const r3 = await fetch(`${API_BASE}/travel-advice?${p3.toString()}`)
      const j3 = await r3.json()
      setAdvice(j3)
    } catch {
      setAdvice(null)
    }
    setLoading(false)
  }, [canSearch, query.country, query.city])

  const loadAlerts = useCallback(async () => {
    try {
      const p = new URLSearchParams()
      p.set("country", query.country)
      if (query.city) p.set("city", query.city)
      const r = await fetch(`${API_BASE}/alerts?${p.toString()}`)
      const j = await r.json()
      setAlerts(Array.isArray(j.alerts) ? j.alerts : [])
    } catch { void 0 }
  }, [query.country, query.city])

  useEffect(() => { load(); loadAlerts() }, [load, loadAlerts])

  const police = contacts.filter((c) => typeMatch(c, "police"))
  const hospital = contacts.filter((c) => typeMatch(c, "hospital"))
  const fire = contacts.filter((c) => typeMatch(c, "fire"))
  const embassy = contacts.filter((c) => typeMatch(c, "embassy"))

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/40" />
      <div className="relative max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-white">Safety & Emergency Hub</h1>
        <p className="text-white/90 mt-1">Police, hospital, fire service and embassy contacts with safety indicators.</p>
        <div
          className="mt-6 w-full md:sticky md:top-24 md:z-30 rounded-2xl p-4 backdrop-blur-md bg-white/60 border border-slate-200/30 transition-shadow duration-300"
          style={{
            boxShadow: "0 10px 30px rgba(2,6,23,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
            outline: "1px solid rgba(255,255,255,0.02)"
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full h-11 w-11"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))",
                  boxShadow: "0 6px 18px rgba(99,102,241,0.06)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800">
                  <path d="M12 2L4 5v6c0 5 3.9 9.7 8 11 4.1-1.3 8-6 8-11V5l-8-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Add contact</h2>
                <div className="text-sm text-slate-500">Add emergency contact for current search area</div>
              </div>
            </div>

            <div className="text-sm text-slate-500 hidden sm:block">**Make sure country & city are set before adding.**</div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <select
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white/75 backdrop-blur-sm text-sm"
              value={newContact.type}
              onChange={(e)=>setNewContact({ ...newContact, type: e.target.value })}
            >
              <option value="police">police</option>
              <option value="hospital">hospital</option>
              <option value="fire">fire</option>
              <option value="embassy">embassy</option>
            </select>

            <input
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white/75 text-sm"
              placeholder="Name"
              value={newContact.name}
              onChange={(e)=>setNewContact({ ...newContact, name: e.target.value })}
            />

            <input
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white/75 text-sm"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e)=>setNewContact({ ...newContact, phone: e.target.value })}
            />

            <input
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white/75 text-sm"
              placeholder="Address"
              value={newContact.address}
              onChange={(e)=>setNewContact({ ...newContact, address: e.target.value })}
            />

            <button
              onClick={async()=>{
                try{
                  if(!query.country?.trim()) return;
                  const r = await fetch(`${API_BASE}/emergency-contacts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...newContact, country: query.country, city: query.city })
                  });
                  if (r.ok) {
                    setNewContact({ type: newContact.type, name: "", phone: "", address: "" });
                    await load();
                    await loadAlerts();
                  }
                } catch { void 0 }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transform transition-transform active:scale-95"
              style={{
                background: "linear-gradient(90deg, #0f172a, #0b1220)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.04)"
              }}
            >
              Add
            </button>
          </div>

          <div aria-hidden="true" style={{
            pointerEvents: "none",
            marginTop: 12,
            height: 2,
            borderRadius: 999,
            background: "linear-gradient(90deg, rgba(99,102,241,0.22), rgba(16,185,129,0.18))",
            filter: "blur(8px)",
            opacity: 0.75
          }} />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="Country code e.g. BD" value={query.country} onChange={(e) => setQuery({ ...query, country: e.target.value.toUpperCase() })} />
          <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="City e.g. Dhaka" value={query.city} onChange={(e) => setQuery({ ...query, city: e.target.value })} />
          <button onClick={async()=>{await load(); await loadAlerts()}} disabled={!canSearch || loading} className={`px-3 py-2 rounded-md ${canSearch && !loading ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>Search</button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {section("Police", "police", police)}
          {section("Hospital", "hospital", hospital)}
          {section("Fire service", "fire", fire)}
          {section("Embassy", "embassy", embassy)}
        </div>


        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-4">
            <h2 className="text-lg font-medium">Safety rating</h2>
            <div className="mt-3">
              {!rating && <div className="text-sm text-slate-500">No rating</div>}
              {rating && (
                <div className="space-y-2 text-sm">
                  <div className="text-slate-700">Rating: {rating.rating ?? "n/a"}</div>
                  {rating.summary && <div className="text-slate-600">{rating.summary}</div>}
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium">Rate as user</div>
              <div className="mt-2 flex items-center gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setUserRate(n)} className={`h-8 w-8 rounded-full ${userRate===n?"bg-yellow-400":"bg-slate-200"}`}>★</button>
                ))}
                <button onClick={async()=>{try{const r=await fetch(`${API_BASE}/safety-rating/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({country:query.country,city:query.city,rating:userRate})});if(r.ok){await load()}}catch{ void 0 }}} className="ml-2 px-3 py-2 rounded-md bg-slate-900 text-white">Submit</button>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium">Admin override</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="Admin key" value={adminKey} onChange={(e)=>setAdminKey(e.target.value)} />
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} onClick={() => setAdminRate(n)} className={`h-8 w-8 rounded-full ${adminRate===n?"bg-yellow-400":"bg-slate-200"}`}>★</button>
                  ))}
                </div>
                <button onClick={async()=>{try{const r=await fetch(`${API_BASE}/safety-rating/admin`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({country:query.country,city:query.city,rating:adminRate,adminKey})});if(r.ok){await load()}}catch{ void 0 }}} className="px-3 py-2 rounded-md bg-slate-900 text-white">Set</button>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-4">
            <h2 className="text-lg font-medium">Travel advisories</h2>
            <div className="mt-3">
              {!advice && <div className="text-sm text-slate-500">No advisories</div>}
              {advice && (
                <div className="space-y-2 text-sm">
                  <div className="text-slate-700">Recommended mode: {advice.recommended_mode ?? "n/a"}</div>
                  {Array.isArray(advice.safety_advice) && advice.safety_advice.length > 0 && (
                    <ul className="list-disc pl-5 text-slate-700">
                      {advice.safety_advice.map((a, i) => (<li key={i}>{a}</li>))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium">Add advisory</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-2">
                <select className="px-3 py-2 rounded-md border border-slate-300 bg-white" value={newAlert.severity} onChange={(e)=>setNewAlert({ ...newAlert, severity: e.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="Start date" value={newAlert.start_date} onChange={(e)=>setNewAlert({ ...newAlert, start_date: e.target.value })} />
                <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="End date" value={newAlert.end_date} onChange={(e)=>setNewAlert({ ...newAlert, end_date: e.target.value })} />
                <input className="px-3 py-2 rounded-md border border-slate-300 bg-white" placeholder="Description" value={newAlert.description} onChange={(e)=>setNewAlert({ ...newAlert, description: e.target.value })} />
                <button onClick={async()=>{try{const r=await fetch(`${API_BASE}/alerts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ ...newAlert, country: query.country, city: query.city })});if(r.ok){setNewAlert({ severity: newAlert.severity, description:"", start_date:"", end_date:""});await loadAlerts()}}catch{ void 0 }}} className="px-3 py-2 rounded-md bg-slate-900 text-white">Add</button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {alerts.map((al)=> (
                  <div key={al._id} className="rounded-lg border border-slate-200 p-3">
                    <div className="text-sm font-semibold">{al.severity}</div>
                    <div className="text-xs text-slate-600">{al.city}, {al.country}</div>
                    <div className="text-xs text-slate-700 mt-1">{al.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

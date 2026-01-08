import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const LOCAL_DOCS_KEY = 'walletDocuments';

const PLACE_ALIASES = {
  bali: 'Indonesia',
  paris: 'France',
  jakarta: 'Indonesia',
  dhaka: 'Bangladesh',
  kathmandu: 'Nepal',
  tokyo: 'Japan',
  osaka: 'Japan',
  seoul: 'South Korea',
  delhi: 'India',
  mumbai: 'India',
  london: 'United Kingdom',
  manchester: 'United Kingdom',
  nyc: 'United States',
  'new york': 'United States',
  la: 'United States',
  'los angeles': 'United States',
  dubai: 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates'
};

const COUNTRY_ALIASES = {
  usa: 'United States',
  us: 'United States',
  uk: 'United Kingdom',
  uae: 'United Arab Emirates',
  korea: 'South Korea'
};

const normalizeCountryInput = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.includes(',')) {
    const last = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .at(-1);
    if (last) return normalizeCountryInput(last);
  }

  const lower = raw.toLowerCase();
  if (COUNTRY_ALIASES[lower]) return COUNTRY_ALIASES[lower];
  if (PLACE_ALIASES[lower]) return PLACE_ALIASES[lower];
  return raw;
};

export default function VisaDocs() {
  const [activeTab, setActiveTab] = useState('visa');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [visaResult, setVisaResult] = useState(null);
  const [loadingVisa, setLoadingVisa] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({
    type: 'Passport',
    country: '',
    documentNumber: '',
    expiryDate: '',
    notes: ''
  });

  const getAuthToken = () => {
    const raw = localStorage.getItem('token');
    if (!raw) return null;

    let t = String(raw).trim();
    if (!t || t === 'undefined' || t === 'null') {
      localStorage.removeItem('token');
      return null;
    }

    if (t.startsWith('"') && t.endsWith('"')) {
      try {
        t = JSON.parse(t);
      } catch {
        return null;
      }
    }

    if (typeof t !== 'string') return null;
    t = t.trim();

    if (t.toLowerCase().startsWith('bearer ')) {
      t = t.slice(7).trim();
    }

    if (t.split('.').length !== 3) return null;
    return t;
  };

  const [token, setToken] = useState(() => getAuthToken());

  useEffect(() => {
    setToken(getAuthToken());
  }, [activeTab]);

  const loadLocalDocuments = () => {
    try {
      const raw = localStorage.getItem(LOCAL_DOCS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(Boolean)
        .map((d, idx) => {
          const doc = typeof d === 'object' ? d : {};
          if (doc._id) return doc;
          const fingerprint = `${doc.type || 'Other'}-${doc.documentNumber || ''}-${doc.expiryDate || ''}-${idx}`;
          return { ...doc, _id: fingerprint };
        });
    } catch {
      return [];
    }
  };

  const saveLocalDocuments = (docs) => {
    try {
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
    } catch { void 0 }
  };

  const checkVisa = async () => {
    if (!origin || !destination) return;
    setLoadingVisa(true);
    try {
      const originNorm = normalizeCountryInput(origin);
      const destinationNorm = normalizeCountryInput(destination);
      const res = await axios.get(
        `${API_BASE}/visa/travel-info?from=${encodeURIComponent(originNorm)}&to=${encodeURIComponent(destinationNorm)}&nationality=${encodeURIComponent(originNorm)}`
      );
      setVisaResult(res.data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to check visa requirements.';
      setVisaResult({ error: String(message) });
    }
    setLoadingVisa(false);
  };

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setDocuments([]);
      }
      setLoadingDocs(false);
      return;
    }

    setDocuments(loadLocalDocuments());
    setLoadingDocs(false);
  }, [token]);

  useEffect(() => {
    if (activeTab === 'docs') fetchDocuments();
  }, [activeTab, fetchDocuments]);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    try {
      if (token) {
        await axios.post(`${API_BASE}/documents`, newDoc, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowAddDoc(false);
        setNewDoc({ type: 'Passport', country: '', documentNumber: '', expiryDate: '', notes: '' });
        fetchDocuments();
        return;
      }

      const localId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const doc = { ...newDoc, _id: localId };
      const next = [doc, ...loadLocalDocuments()];
      saveLocalDocuments(next);
      setDocuments(next);
      setShowAddDoc(false);
      setNewDoc({ type: 'Passport', country: '', documentNumber: '', expiryDate: '', notes: '' });
    } catch (err) {
      console.error("Failed to add document:", err.response ? err.response.data : err.message);
      alert(`Failed to add document: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      if (token) {
        await axios.delete(`${API_BASE}/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDocuments();
        return;
      }

      const next = loadLocalDocuments().filter((d) => d?._id !== id);
      saveLocalDocuments(next);
      setDocuments(next);
    } catch {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-700 to-slate-100 opacity-10 pointer-events-none" />
      
      {/* Main Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-fade-in-down">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3">
            Travel Essentials
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Visa & Documents
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Manage your travel identity and check visa requirements for your next adventure.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full shadow-lg border border-slate-200 inline-flex relative">
            <button
              onClick={() => setActiveTab('visa')}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === 'visa' 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="mr-2">🌍</span> Visa Checker
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === 'docs' 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="mr-2">💼</span> My Wallet
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500">
          
          {/* --- VISA CHECKER TAB --- */}
          {activeTab === 'visa' && (
            <div className="animate-fade-in-up max-w-3xl mx-auto">
              {/* Search Card */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-white/50 px-8 py-6 border-b border-slate-200/60">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">✈️</span> Check Entry Requirements
                  </h2>
                </div>
                
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">From</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors">🛫</span>
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-slate-700"
                          placeholder="Origin country (e.g., France or FR)"
                          value={origin}
                          onChange={e => setOrigin(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center pb-3 text-slate-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">To</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors">🛬</span>
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-slate-700"
                          placeholder="Destination country (e.g., Indonesia or ID)"
                          value={destination}
                          onChange={e => setDestination(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      onClick={checkVisa}
                      disabled={loadingVisa || !origin || !destination}
                      className="w-full md:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingVisa ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Check'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Card (Ticket Style) */}
              {visaResult && (
                <div className="mt-8 animate-fade-in-up">
                  {visaResult.error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                      <span className="text-2xl mt-1">⚠️</span>
                      <div>
                        <h3 className="font-bold text-lg">Unable to Check</h3>
                        <p className="opacity-80">{visaResult.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden relative">
                      {(() => {
                        const route = visaResult?.route && typeof visaResult.route === 'object' ? visaResult.route : {};
                        const visa = visaResult?.visa_requirements && typeof visaResult.visa_requirements === 'object' ? visaResult.visa_requirements : {};
                        const status = typeof visa.status === 'string' && visa.status ? visa.status : 'Unknown';

                        const headerClass =
                          status === 'Visa-Free' ? 'bg-emerald-500' :
                          status === 'Visa Required' ? 'bg-rose-500' :
                          status === 'Visa on Arrival' ? 'bg-amber-400' :
                          status === 'eVisa' ? 'bg-indigo-500' :
                          'bg-slate-300';

                        const badgeClass =
                          status === 'Visa-Free' ? 'bg-emerald-100 text-emerald-700' :
                          status === 'Visa Required' ? 'bg-rose-100 text-rose-700' :
                          status === 'Visa on Arrival' ? 'bg-amber-100 text-amber-700' :
                          status === 'eVisa' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700';

                        const requirementText = typeof visa.details === 'string' && visa.details ? visa.details : 'No visa details available.';

                        const requirementRows = [
                          { label: 'Nationality', value: route.nationality },
                          { label: 'Duration (days)', value: visa.duration },
                          { label: 'Confidence', value: visa.confidence },
                        ].filter((r) => r.value);

                        const embassyList = Array.isArray(visaResult?.embassy_contacts) ? visaResult.embassy_contacts : [];

                        return (
                          <>
                            <div className={`h-3 w-full ${headerClass}`} />
                            <div className="p-8">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                  <div className="flex items-center gap-3 text-slate-500 mb-1">
                                    <span className="font-semibold uppercase tracking-wider text-xs">Route Info</span>
                                    <div className="h-px w-12 bg-slate-200" />
                                  </div>
                                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    {route.from || '—'}
                                    <span className="text-slate-300">→</span>
                                    {route.to || '—'}
                                  </h3>
                                </div>

                                <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm ${badgeClass}`}>
                                  {status}
                                </span>
                              </div>

                              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                  <span>📝</span> Requirements
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                  {requirementText}
                                </p>
                                {requirementRows.length > 0 && (
                                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {requirementRows.map((r) => (
                                      <div key={r.label} className="rounded-xl bg-white border border-slate-200 p-3">
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{r.label}</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-800 break-words">{String(r.value)}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                  <span>🏛️</span> Embassy & Contacts
                                </h4>

                                {embassyList.length > 0 ? (
                                  <div className="space-y-6">
                                    {embassyList.map((item, idx) => {
                                      const embassy = item && typeof item === 'object' ? item : {};
                                      const web = typeof embassy.website === 'string' ? embassy.website : '';
                                      const webHref = web ? (web.startsWith('http://') || web.startsWith('https://') ? web : `https://${web}`) : '';
                                      const embassyRows = [
                                        { label: 'Name', value: embassy.name },
                                        { label: 'Phone', value: embassy.phone },
                                        { label: 'Email', value: embassy.email },
                                        { label: 'Address', value: embassy.address },
                                      ].filter((r) => r.value);

                                      return (
                                        <div key={`${idx}-${embassy.name || ''}`} className="rounded-2xl bg-white border border-slate-200 p-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {embassyRows.map((r) => (
                                              <div key={r.label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{r.label}</div>
                                                <div className="mt-1 text-sm font-semibold text-slate-800 break-words">{String(r.value)}</div>
                                              </div>
                                            ))}
                                          </div>
                                          {webHref && (
                                            <a
                                              href={webHref}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-4"
                                            >
                                              Official website
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-600">No embassy contacts found for this route.</p>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      {/* Ticket Perforations (Visual Flair) */}
                      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full" />
                      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {/* --- DOCUMENTS TAB --- */}
          {activeTab === 'docs' && (
            <div className="animate-fade-in-up">
              
              {/* Action Bar */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">My Wallet</h2>
                  <p className="text-slate-500 text-sm">Stored securely on your device.</p>
                </div>
                <button
                  onClick={() => setShowAddDoc(!showAddDoc)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                    showAddDoc 
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                  }`}
                >
                  {showAddDoc ? 'Cancel' : (
                    <>
                      <span>+</span> Add Document
                    </>
                  )}
                </button>
              </div>

              {/* Add Document Form */}
              {showAddDoc && (
                <div className="mb-10 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-down">
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Add New Document</h3>
                  </div>
                  <div className="p-8">
                    <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                        <select
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          value={newDoc.type}
                          onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
                        >
                          <option>Passport</option>
                          <option>Visa</option>
                          <option>ID Card</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          placeholder="e.g. Japan"
                          value={newDoc.country}
                          onChange={e => setNewDoc({ ...newDoc, country: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Document No.</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          placeholder="A12345678"
                          value={newDoc.documentNumber}
                          onChange={e => setNewDoc({ ...newDoc, documentNumber: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                          value={newDoc.expiryDate}
                          onChange={e => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                        <textarea
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none h-24"
                          placeholder="Additional details..."
                          value={newDoc.notes}
                          onChange={e => setNewDoc({ ...newDoc, notes: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2 pt-2">
                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.99]">
                          Save to Wallet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingDocs ? (
                  <div className="col-span-full flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-6xl mb-4 opacity-50">📂</div>
                    <h3 className="text-xl font-bold text-slate-800">Your wallet is empty</h3>
                    <p className="text-slate-500 mt-2">Add a passport or visa to get started.</p>
                  </div>
                ) : (
                  documents.filter(Boolean).map((doc, idx) => {
                    const safeDoc = typeof doc === 'object' ? doc : {};
                    const type = safeDoc.type || 'Other';
                    const isPassport = type === 'Passport';
                    const isVisa = type === 'Visa';

                    const expiryMs = Date.parse(safeDoc.expiryDate);
                    const expiryValid = Number.isFinite(expiryMs);
                    const expiry = expiryValid ? new Date(expiryMs) : null;
                    const expiringThresholdMs = new Date(new Date().setMonth(new Date().getMonth() + 6)).getTime();
                    const isExpiring = expiryValid ? expiryMs < expiringThresholdMs : false;

                    return (
                      <div 
                        key={safeDoc._id || `${type}-${idx}`} 
                        className={`relative group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                          isPassport 
                            ? 'bg-[#1a237e] text-white shadow-xl shadow-blue-900/20' 
                            : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                        }`}
                      >
                        {/* Card Header */}
                        <div className={`p-6 ${isPassport ? 'bg-white/5' : 'bg-slate-50/50'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {isPassport ? '🛂' : isVisa ? '🎫' : '📄'}
                              </span>
                              <div>
                                <h3 className={`font-bold text-lg tracking-wide ${isPassport ? 'text-white' : 'text-slate-800'}`}>
                                  {type}
                                </h3>
                                <p className={`text-sm ${isPassport ? 'text-blue-200' : 'text-slate-500'}`}>
                                  {safeDoc.country || 'International'}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteDocument(safeDoc._id || `${type}-${idx}`)}
                              className={`p-2 rounded-full transition-colors ${
                                isPassport 
                                  ? 'text-white/30 hover:bg-white/10 hover:text-white' 
                                  : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                              }`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 space-y-4">
                          <div>
                            <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${
                              isPassport ? 'text-blue-300' : 'text-slate-400'
                            }`}>
                              Document Number
                            </p>
                            <p className={`font-mono text-xl tracking-wider ${
                              isPassport ? 'text-white' : 'text-slate-700'
                            }`}>
                              {safeDoc.documentNumber || '—'}
                            </p>
                          </div>

                          <div>
                            <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${
                              isPassport ? 'text-blue-300' : 'text-slate-400'
                            }`}>
                              Expires On
                            </p>
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${
                                isPassport ? 'text-white' : 'text-slate-700'
                              }`}>
                                {expiryValid ? expiry.toLocaleDateString() : 'Unknown'}
                              </p>
                              {isExpiring && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                                  EXPIRING
                                </span>
                              )}
                            </div>
                          </div>

                          {safeDoc.notes && (
                            <div className={`pt-4 mt-2 border-t ${
                              isPassport ? 'border-white/10' : 'border-slate-100'
                            }`}>
                              <p className={`text-xs italic ${
                                isPassport ? 'text-blue-200' : 'text-slate-500'
                              }`}>
                                "{safeDoc.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Decorative Stripe for Passports */}
                        {isPassport && (
                          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

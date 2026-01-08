// Simple mock database of visa requirements
// In a real app, this would check a 3rd party API or a comprehensive DB
const visaRules = [
  { origin: 'United States', destination: 'United Kingdom', requirement: 'No Visa required for up to 6 months.', type: 'Visa-Free' },
  { origin: 'United States', destination: 'France', requirement: 'No Visa required for up to 90 days (Schengen).', type: 'Visa-Free' },
  { origin: 'United States', destination: 'China', requirement: 'Visa required.', type: 'Visa Required' },
  { origin: 'United States', destination: 'India', requirement: 'e-Visa required.', type: 'e-Visa' },
  { origin: 'Bangladesh', destination: 'United States', requirement: 'Visa required.', type: 'Visa Required' },
  { origin: 'Bangladesh', destination: 'India', requirement: 'Visa required.', type: 'Visa Required' },
  { origin: 'Bangladesh', destination: 'Bhutan', requirement: 'No Visa required.', type: 'Visa-Free' },
  // Default rule fallback
];

const https = require('https');

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

const isIso2 = (value) => /^[a-z]{2}$/i.test(String(value || '').trim());

const httpsJson = (url, { method = 'GET', headers, body, timeoutMs = 8000 } = {}) =>
  new Promise((resolve, reject) => {
    const request = https.request(
      url,
      { method, headers },
      (r) => {
        let data = '';
        r.on('data', (chunk) => {
          data += chunk;
        });
        r.on('end', () => {
          if (r.statusCode && r.statusCode >= 400) {
            const err = new Error(`HTTP ${r.statusCode}`);
            err.statusCode = r.statusCode;
            err.body = data;
            return reject(err);
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            const err = new Error('Invalid JSON response');
            err.body = data;
            reject(err);
          }
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });

const httpsText = (url, { method = 'GET', headers, body, timeoutMs = 8000 } = {}) =>
  new Promise((resolve, reject) => {
    const request = https.request(
      url,
      { method, headers },
      (r) => {
        let data = '';
        r.on('data', (chunk) => {
          data += chunk;
        });
        r.on('end', () => {
          if (r.statusCode && r.statusCode >= 400) {
            const err = new Error(`HTTP ${r.statusCode}`);
            err.statusCode = r.statusCode;
            err.body = data;
            return reject(err);
          }
          resolve(data);
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });

const countryCodeCache = new Map();

const resolveCountryCode = async (value) => {
  const normalized = normalizeCountryInput(value);
  if (!normalized) return null;
  if (isIso2(normalized)) return normalized.toUpperCase();

  const key = normalized.toLowerCase();
  if (countryCodeCache.has(key)) return countryCodeCache.get(key);

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(normalized)}?fullText=true`;
  try {
    const data = await httpsJson(url, { headers: { Accept: 'application/json', 'User-Agent': 'WanderGo/1.0' }, timeoutMs: 8000 });
    const first = Array.isArray(data) ? data[0] : null;
    const code = first?.cca2 ? String(first.cca2).toUpperCase() : null;
    if (code && isIso2(code)) {
      countryCodeCache.set(key, code);
      return code;
    }
  } catch { void 0 }

  const url2 = `https://restcountries.com/v3.1/name/${encodeURIComponent(normalized)}`;
  try {
    const data = await httpsJson(url2, { headers: { Accept: 'application/json', 'User-Agent': 'WanderGo/1.0' }, timeoutMs: 8000 });
    const first = Array.isArray(data) ? data[0] : null;
    const code = first?.cca2 ? String(first.cca2).toUpperCase() : null;
    if (code && isIso2(code)) {
      countryCodeCache.set(key, code);
      return code;
    }
  } catch { void 0 }

  return null;
};

const parseCsvLine = (line) => {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

const passportIndexCache = {
  loadedAt: 0,
  rowsByKey: new Map(),
  inFlight: null
};

const PASSPORT_INDEX_URL =
  'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso2.csv';

const loadPassportIndexDataset = async () => {
  const now = Date.now();
  if (passportIndexCache.loadedAt && now - passportIndexCache.loadedAt < 12 * 60 * 60 * 1000 && passportIndexCache.rowsByKey.size) {
    return passportIndexCache;
  }

  if (passportIndexCache.inFlight) return passportIndexCache.inFlight;

  passportIndexCache.inFlight = (async () => {
    const csv = await httpsText(PASSPORT_INDEX_URL, {
      headers: { Accept: 'text/csv', 'User-Agent': 'WanderGo/1.0' },
      timeoutMs: 12000
    });
    const lines = String(csv || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const next = new Map();
    for (let i = 0; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (i === 0 && cols.some((c) => /passport/i.test(c) || /destination/i.test(c))) continue;
      const passport = cols[0] ? String(cols[0]).toUpperCase() : '';
      const destination = cols[1] ? String(cols[1]).toUpperCase() : '';
      const requirementRaw = cols[2] ? String(cols[2]).trim() : '';
      if (!isIso2(passport) || !isIso2(destination) || !requirementRaw) continue;
      next.set(`${passport}|${destination}`, requirementRaw);
    }

    passportIndexCache.rowsByKey = next;
    passportIndexCache.loadedAt = Date.now();
    passportIndexCache.inFlight = null;
    return passportIndexCache;
  })();

  try {
    return await passportIndexCache.inFlight;
  } catch (e) {
    passportIndexCache.inFlight = null;
    throw e;
  }
};

const formatRequirementFromPassportIndex = (raw) => {
  const v = String(raw || '').trim();
  const lower = v.toLowerCase();

  if (!v) return { type: 'Unknown', requirement: 'Check official sources for entry requirements.' };
  if (lower === 'visa free' || lower === 'visa-free') return { type: 'Visa-Free', requirement: 'No visa required (visa-free entry).' };
  if (lower === 'visa required') return { type: 'Visa Required', requirement: 'Visa required before arrival.' };
  if (lower === 'visa on arrival') return { type: 'Visa on Arrival', requirement: 'Visa on arrival is available.' };
  if (lower === 'e-visa' || lower === 'evisa') return { type: 'e-Visa', requirement: 'e-Visa is available.' };
  if (lower === 'eta' || lower === 'e-ta' || lower === 'e-ta required' || lower === 'e-ta available') return { type: 'eTA', requirement: `Entry authorization: ${v}.` };
  if (lower.includes('no admission') || lower.includes('banned') || lower.includes('covid')) return { type: 'Restricted', requirement: `Entry restriction: ${v}.` };

  return { type: 'Info', requirement: v };
};

const wikidataCache = new Map();
const wikidataCountryQidCache = new Map();

const wikidataJson = async (url) =>
  httpsJson(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WanderGo/1.0'
    },
    timeoutMs: 12000
  });

const wikidataSparql = async (query) => {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(String(query || ''))}`;
  return httpsJson(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'WanderGo/1.0'
    },
    timeoutMs: 15000
  });
};

const pickFirstSparqlBindingValue = (b, key) => {
  const v = b?.[key]?.value;
  return typeof v === 'string' && v.trim() ? v.trim() : '';
};

const wikidataSearchEntities = async (search) => {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=6&search=${encodeURIComponent(
    search
  )}`;
  const json = await wikidataJson(url);
  const items = Array.isArray(json?.search) ? json.search : [];
  return items
    .map((r) => ({ id: r?.id, label: r?.label, description: r?.description }))
    .filter((r) => r.id && /^Q\d+$/.test(r.id));
};

const getEntityInstanceOfIds = (entity) => {
  const arr = entity?.claims?.P31;
  if (!Array.isArray(arr)) return [];
  const ids = [];
  for (const snak of arr) {
    const id = snak?.mainsnak?.datavalue?.value?.id;
    if (typeof id === 'string' && /^Q\d+$/.test(id)) ids.push(id);
  }
  return ids;
};

const resolveWikidataCountryQid = async (countryName) => {
  const name = String(countryName || '').trim();
  if (!name) return null;
  const key = name.toLowerCase();
  if (wikidataCountryQidCache.has(key)) return wikidataCountryQidCache.get(key);

  let qid = null;
  let candidates = [];
  try {
    candidates = await wikidataSearchEntities(name);
  } catch { void 0 }

  for (const c of candidates) {
    if (!c?.id) continue;
    let entity = null;
    try {
      entity = await wikidataGetEntity(c.id);
    } catch { void 0 }
    if (!entity) continue;
    const instanceOf = new Set(getEntityInstanceOfIds(entity));
    if (instanceOf.has('Q6256') || instanceOf.has('Q3624078') || instanceOf.has('Q7275')) {
      qid = c.id;
      break;
    }
  }

  if (!qid && candidates[0]?.id) qid = candidates[0].id;
  wikidataCountryQidCache.set(key, qid);
  return qid;
};

const escapeSparqlStringLiteral = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');

const fetchEmbassyContactsFromWikidataCountries = async ({ residingCountryName, destinationCountryName }) => {
  const fromName = String(residingCountryName || '').trim();
  const toName = String(destinationCountryName || '').trim();
  if (!fromName || !toName) return [];

  const [fromQ, toQ] = await Promise.all([resolveWikidataCountryQid(fromName), resolveWikidataCountryQid(toName)]);
  if (!fromQ || !toQ) return [];

  const cacheKey = `missions|${fromQ}|${toQ}`;
  const cached = wikidataCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.loadedAt < 12 * 60 * 60 * 1000) return cached.value || [];

  const fromLabel = escapeSparqlStringLiteral(fromName);
  const toLabel = escapeSparqlStringLiteral(toName);

  const queries = [
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX bd: <http://www.bigdata.com/rdf#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31 wd:Q3917681;
                 wdt:P17 wd:${toQ};
                 wdt:P131* wd:${fromQ}.
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 20
    `,
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX bd: <http://www.bigdata.com/rdf#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31/wdt:P279* wd:Q213283;
                 wdt:P17 wd:${toQ};
                 wdt:P131* wd:${fromQ}.
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 20
    `,
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX bd: <http://www.bigdata.com/rdf#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31 wd:Q3917681;
                 wdt:P17 wd:${fromQ};
                 wdt:P131* wd:${toQ}.
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 20
    `,
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX bd: <http://www.bigdata.com/rdf#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31/wdt:P279* wd:Q213283;
                 wdt:P17 wd:${fromQ};
                 wdt:P131* wd:${toQ}.
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 20
    `,
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31/wdt:P279* wd:Q213283;
                 wdt:P17 wd:${fromQ}.
        ?mission rdfs:label ?missionLabel.
        FILTER(LANG(?missionLabel) = "en")
        FILTER(CONTAINS(LCASE(?missionLabel), LCASE("${toLabel}")))
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
      }
      LIMIT 20
    `,
    `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
        ?mission wdt:P31/wdt:P279* wd:Q213283;
                 wdt:P17 wd:${toQ}.
        ?mission rdfs:label ?missionLabel.
        FILTER(LANG(?missionLabel) = "en")
        FILTER(CONTAINS(LCASE(?missionLabel), LCASE("${fromLabel}")))
        OPTIONAL { ?mission wdt:P6375 ?address. }
        OPTIONAL { ?mission wdt:P969 ?address. }
        OPTIONAL { ?mission wdt:P1329 ?phone. }
        OPTIONAL { ?mission wdt:P968 ?email. }
        OPTIONAL { ?mission wdt:P856 ?website. }
      }
      LIMIT 20
    `
  ];

  const byMission = new Map();

  for (const q of queries) {
    let bindings = [];
    try {
      const json = await wikidataSparql(q);
      bindings = Array.isArray(json?.results?.bindings) ? json.results.bindings : [];
    } catch { void 0 }
    if (!bindings.length) continue;

    for (const b of bindings) {
      const missionUrl = pickFirstSparqlBindingValue(b, 'mission');
      if (!missionUrl) continue;
      const idMatch = missionUrl.match(/\/entity\/(Q\d+)$/);
      const id = idMatch ? idMatch[1] : null;

      const current = byMission.get(missionUrl) || {
        id,
        name: null,
        address: null,
        phone: null,
        email: null,
        website: null
      };

      const missionLabel = pickFirstSparqlBindingValue(b, 'missionLabel') || null;
      const address = pickFirstSparqlBindingValue(b, 'address') || null;
      const phone = pickFirstSparqlBindingValue(b, 'phone') || null;
      const email = pickFirstSparqlBindingValue(b, 'email') || null;
      const website = pickFirstSparqlBindingValue(b, 'website') || null;

      if (!current.id && id) current.id = id;
      if (!current.name && missionLabel) current.name = missionLabel;
      if (!current.address && address) current.address = address;
      if (!current.phone && phone) current.phone = phone;
      if (!current.email && email) current.email = email;
      if (!current.website && website) current.website = website;

      byMission.set(missionUrl, current);
    }

    if (byMission.size >= 8) break;
  }

  const missions = Array.from(byMission.values()).filter((m) => m?.name || m?.address || m?.phone || m?.email || m?.website);
  wikidataCache.set(cacheKey, { loadedAt: Date.now(), value: missions });
  return missions;
};

const fetchEmbassyFromWikidataSparql = async (searchText) => {
  const q = String(searchText || '').trim();
  if (!q) return null;

  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX wikibase: <http://wikiba.se/ontology#>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
    SELECT ?mission ?missionLabel ?address ?phone ?email ?website WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${q.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}" .
        bd:serviceParam mwapi:language "en" .
        bd:serviceParam mwapi:limit 10 .
        ?mission wikibase:apiOutputItem mwapi:item .
      }
      OPTIONAL { ?mission wdt:P969 ?address . }
      OPTIONAL { ?mission wdt:P1329 ?phone . }
      OPTIONAL { ?mission wdt:P968 ?email . }
      OPTIONAL { ?mission wdt:P856 ?website . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 10
  `;

  const json = await wikidataSparql(query);
  const bindings = Array.isArray(json?.results?.bindings) ? json.results.bindings : [];
  for (const b of bindings) {
    const name = pickFirstSparqlBindingValue(b, 'missionLabel');
    const address = pickFirstSparqlBindingValue(b, 'address');
    const telephone = pickFirstSparqlBindingValue(b, 'phone');
    const email = pickFirstSparqlBindingValue(b, 'email');
    const web = pickFirstSparqlBindingValue(b, 'website');
    const missionUrl = pickFirstSparqlBindingValue(b, 'mission');

    const any =
      (typeof name === 'string' && name.trim()) ||
      (typeof address === 'string' && address.trim()) ||
      (typeof telephone === 'string' && telephone.trim()) ||
      (typeof email === 'string' && email.trim()) ||
      (typeof web === 'string' && web.trim());

    if (!any) continue;

    const idMatch = missionUrl.match(/\/entity\/(Q\d+)$/);
    const id = idMatch ? idMatch[1] : '';
    return {
      name: name || '',
      address: address || '',
      telephone: telephone || '',
      email: email || '',
      web: web || '',
      details: { source: 'wikidata', id: id || null }
    };
  }
  return null;
};

async function wikidataGetEntity(id) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(id)}.json`;
  const json = await wikidataJson(url);
  const entity = json?.entities?.[id];
  return entity && typeof entity === 'object' ? entity : null;
}

const getEntityLabelEn = (entity) => {
  const label = entity?.labels?.en?.value;
  return typeof label === 'string' && label.trim() ? label.trim() : '';
};

const getFirstStringClaim = (claims, prop) => {
  const arr = claims?.[prop];
  if (!Array.isArray(arr)) return '';
  for (const snak of arr) {
    const v = snak?.mainsnak?.datavalue?.value;
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

const getFirstUrlClaim = (claims, prop) => {
  const arr = claims?.[prop];
  if (!Array.isArray(arr)) return '';
  for (const snak of arr) {
    const v = snak?.mainsnak?.datavalue?.value;
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

const fetchEmbassyFromWikidata = async ({ originCode, destinationCode }) => {
  const key = `${String(originCode || '').toUpperCase()}|${String(destinationCode || '').toUpperCase()}`;
  const cached = wikidataCache.get(key);
  const now = Date.now();
  if (cached && now - cached.loadedAt < 12 * 60 * 60 * 1000) return cached.value;

  const originName = (await resolveCountryNameFromCode(originCode)) || originCode;
  const destinationName = (await resolveCountryNameFromCode(destinationCode)) || destinationCode;

  const searches = [
    `Embassy of ${originName} in ${destinationName}`,
    `${originName} embassy ${destinationName}`,
    `Consulate of ${originName} in ${destinationName}`,
    `${originName} consulate ${destinationName}`
  ];

  for (const q of searches) {
    try {
      const embassy = await fetchEmbassyFromWikidataSparql(q);
      if (embassy) {
        wikidataCache.set(key, { loadedAt: Date.now(), value: embassy });
        return embassy;
      }
    } catch { void 0 }

    let candidates = [];
    try {
      candidates = await wikidataSearchEntities(q);
    } catch { void 0 }
    for (const c of candidates) {
      let entity = null;
      try {
        entity = await wikidataGetEntity(c.id);
      } catch { void 0 }
      if (!entity) continue;
      const claims = entity.claims || {};
      const name = getEntityLabelEn(entity) || c.label || '';
      const address = getFirstStringClaim(claims, 'P969');
      const phone = getFirstStringClaim(claims, 'P1329');
      const email = getFirstStringClaim(claims, 'P968');
      const web = getFirstUrlClaim(claims, 'P856');

      const any =
        (typeof name === 'string' && name.trim()) ||
        (typeof address === 'string' && address.trim()) ||
        (typeof phone === 'string' && phone.trim()) ||
        (typeof email === 'string' && email.trim()) ||
        (typeof web === 'string' && web.trim());

      if (!any) continue;

      const embassy = {
        name: name || '',
        address: address || '',
        telephone: phone || '',
        email: email || '',
        web: web || '',
        details: { source: 'wikidata', id: c.id }
      };
      wikidataCache.set(key, { loadedAt: Date.now(), value: embassy });
      return embassy;
    }
  }

  wikidataCache.set(key, { loadedAt: Date.now(), value: null });
  return null;
};

async function resolveCountryNameFromCode(code) {
  if (!isIso2(code)) return null;
  const upper = String(code).toUpperCase();
  const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(upper)}`;
  try {
    const data = await httpsJson(url, { headers: { Accept: 'application/json', 'User-Agent': 'WanderGo/1.0' }, timeoutMs: 8000 });
    const first = Array.isArray(data) ? data[0] : null;
    const name = first?.name?.common ? String(first.name.common) : null;
    return name || null;
  } catch {
    return null;
  }
}

const fetchTravelBriefingPayload = async (destination) => {
  const dest = normalizeCountryInput(destination);
  if (!dest) throw new Error('Destination is required');

  const destinationName = isIso2(dest) ? (await resolveCountryNameFromCode(dest)) || dest : dest;
  const url = `https://travelbriefing.org/${encodeURIComponent(destinationName)}?format=json`;
  const apiKey = process.env.TRAVELBRIEFING_API_KEY;

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'WanderGo/1.0',
    ...(apiKey ? { 'X-API-Key': apiKey } : {})
  };

  return httpsJson(url, { headers, timeoutMs: 8000 });
};

const extractVisaTextFromTravelBriefing = (payload) => {
  if (!payload || typeof payload !== 'object') return '';
  const v = payload.visa;
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const direct =
      v.message ||
      v.text ||
      v.description ||
      v.requirement ||
      v.advice;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    try {
      return JSON.stringify(v);
    } catch {
      return '';
    }
  }
  return '';
};

const httpsRaw = (url, { method = 'GET', headers, body, timeoutMs = 12000, maxBytes = 900_000 } = {}) =>
  new Promise((resolve, reject) => {
    const request = https.request(
      url,
      { method, headers },
      (r) => {
        let data = '';
        let exceeded = false;
        r.on('data', (chunk) => {
          if (exceeded) return;
          data += chunk;
          if (data.length > maxBytes) {
            exceeded = true;
            request.destroy(new Error('Response too large'));
          }
        });
        r.on('end', () => {
          resolve({ statusCode: r.statusCode || 0, headers: r.headers || {}, body: data });
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });

const fetchTextFollowRedirects = async (url, { headers, timeoutMs = 12000 } = {}) => {
  let current = String(url || '');
  for (let i = 0; i < 4; i++) {
    const res = await httpsRaw(current, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
        'User-Agent': 'WanderGo/1.0',
        ...(headers || {})
      },
      timeoutMs
    });
    const code = Number(res.statusCode || 0);
    if (code >= 300 && code < 400 && res.headers && res.headers.location) {
      current = new URL(String(res.headers.location), current).toString();
      continue;
    }
    return { finalUrl: current, body: String(res.body || '') };
  }
  const err = new Error('Too many redirects');
  err.code = 'TOO_MANY_REDIRECTS';
  throw err;
};

const decodeHtmlEntities = (s) =>
  String(s || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const htmlToText = (html) => {
  const raw = String(html || '');
  const withoutScripts = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withBreaks = withoutScripts
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h1|\/h2|\/h3|\/h4|\/h5|\/h6)\b[^>]*>/gi, '\n')
    .replace(/<p\b[^>]*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(withBreaks)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

const uniq = (arr) => {
  const out = [];
  const seen = new Set();
  for (const v of arr || []) {
    const s = String(v || '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
};

const tryDecodeDuckDuckGoRedirect = (href) => {
  const h = String(href || '').trim();
  if (!h) return '';
  try {
    const u = new URL(h, 'https://duckduckgo.com');
    const uddg = u.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    return u.toString();
  } catch {
    return '';
  }
};

const duckDuckGoSearchUrls = async (query, { max = 8 } = {}) => {
  const q = String(query || '').trim();
  if (!q) return [];
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const { body } = await fetchTextFollowRedirects(url, { timeoutMs: 15000 });
  const html = String(body || '');
  const urls = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const decoded = tryDecodeDuckDuckGoRedirect(m[1] || '');
    if (!decoded) continue;
    if (!/^https?:\/\//i.test(decoded)) continue;
    urls.push(decoded);
    if (urls.length >= max * 3) break;
  }
  return uniq(urls).slice(0, max);
};

const isBadSourceHost = (host) => {
  const h = String(host || '').toLowerCase();
  if (!h) return true;
  if (h.includes('wikipedia.org')) return true;
  if (h.includes('wikidata.org')) return true;
  if (h.includes('embassypages.com')) return true;
  if (h.includes('embassy-worldwide.com')) return true;
  if (h.includes('embassy-finder.com')) return true;
  if (h.includes('visahq.com')) return true;
  if (h.includes('ivisa.com')) return true;
  if (h.includes('visaguide')) return true;
  if (h.includes('facebook.com')) return true;
  if (h.includes('instagram.com')) return true;
  if (h.includes('twitter.com')) return true;
  if (h.includes('x.com')) return true;
  if (h.includes('youtube.com')) return true;
  if (h.includes('tiktok.com')) return true;
  if (h.includes('tripadvisor')) return true;
  if (h.includes('reddit.com')) return true;
  return false;
};

const scoreOfficialHost = (host) => {
  const h = String(host || '').toLowerCase();
  if (!h) return 0;
  if (isBadSourceHost(h)) return -10;
  let score = 0;
  if (/\.(gov|gouv)\b/.test(h)) score += 6;
  if (/\bgo\.[a-z]{2}\b/.test(h)) score += 5;
  if (h.includes('mofa') || h.includes('foreign') || h.includes('diplom')) score += 3;
  if (h.includes('embassy') || h.includes('consulate')) score += 2;
  return score;
};

const extractEmails = (text) => {
  const t = String(text || '');
  const matches = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return uniq(matches).slice(0, 3);
};

const extractPhones = (text) => {
  const t = String(text || '');
  const matches = t.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?)?\d[\d\s().-]{6,}\d/g) || [];
  const cleaned = matches
    .map((m) => m.replace(/\s{2,}/g, ' ').trim())
    .filter((m) => m.replace(/[^\d]/g, '').length >= 7);
  return uniq(cleaned).slice(0, 3);
};

const extractMaxStayDays = (text) => {
  const t = String(text || '');
  const m =
    t.match(/\b(?:up to|maximum stay(?: of)?|max(?:imum)? stay(?: of)?)\s*(\d{1,3})\s*(?:days|day)\b/i) ||
    t.match(/\b(\d{1,3})\s*(?:days|day)\b[\s\S]{0,30}\b(?:visa[- ]?free|without a visa)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0 || n > 365) return null;
  return n;
};

const classifyVisaStatusFromText = (text) => {
  const t = String(text || '').toLowerCase();
  if (!t) return null;
  if (t.includes('visa on arrival')) return 'Visa on Arrival';
  if (t.includes('evisa') || t.includes('e-visa') || t.includes('electronic visa') || t.includes('apply online')) return 'eVisa';
  if (t.includes('visa-free') || t.includes('visa free') || t.includes('no visa required') || t.includes('without a visa'))
    return 'Visa-Free';
  if (t.includes('visa required') || t.includes('must obtain a visa') || t.includes('need a visa')) return 'Visa Required';
  return null;
};

const pickVisaNotes = (text) => {
  const t = String(text || '');
  const lower = t.toLowerCase();
  const parts = [];
  if (lower.includes('passport') && (lower.includes('6 months') || lower.includes('six months'))) parts.push('Passport validity may require 6 months.');
  if (lower.includes('return') && lower.includes('ticket')) parts.push('May require onward/return ticket.');
  if (lower.includes('tourism') || lower.includes('tourist')) parts.push('Rules may vary by purpose of travel.');
  if (parts.length === 0) return null;
  return uniq(parts).join(' ');
};

const bestOfficialPageForQuery = async (query, { minScore = 1 } = {}) => {
  const urls = await duckDuckGoSearchUrls(query, { max: 10 });
  const candidates = urls
    .map((u) => {
      try {
        const host = new URL(u).hostname;
        return { url: u, host, score: scoreOfficialHost(host) };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  for (const c of candidates) {
    if ((c.score || 0) < minScore) continue;
    try {
      const fetched = await fetchTextFollowRedirects(c.url, { timeoutMs: 15000 });
      const text = htmlToText(fetched.body);
      if (!text) continue;
      return { ...fetched, text };
    } catch { void 0 }
  }
  return null;
};

const extractEmbassyContactsFromPage = ({ text, finalUrl, fallbackName }) => {
  const emails = extractEmails(text);
  const phones = extractPhones(text);
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim());
  let address = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (/^address\b/i.test(line) || /\baddress\s*:/i.test(line)) {
      const after = line.replace(/^address\b\s*:?\s*/i, '').trim();
      const next = [after, lines[i + 1], lines[i + 2], lines[i + 3]].filter(Boolean).join(', ');
      if (next && next.length >= 12) {
        address = next;
        break;
      }
    }
  }
  if (!address) {
    const idx = lines.findIndex((l) => /\b(chancery|consular section)\b/i.test(l));
    if (idx >= 0) {
      const next = [lines[idx + 1], lines[idx + 2], lines[idx + 3]].filter(Boolean).join(', ');
      if (next && next.length >= 12) address = next;
    }
  }

  let website = null;
  try {
    website = new URL(finalUrl).origin;
  } catch {
    website = String(finalUrl || '').trim() || null;
  }

  return {
    name: String(fallbackName || '').trim() || null,
    address: address || null,
    phone: phones[0] || null,
    email: emails[0] || null,
    website
  };
};

const isOfficialUrl = (url, { minScore = 5 } = {}) => {
  const u = String(url || '').trim();
  if (!u) return false;
  try {
    const host = new URL(u).hostname;
    return scoreOfficialHost(host) >= minScore;
  } catch {
    return false;
  }
};

const isOfficialEmail = (email, { minScore = 5 } = {}) => {
  const e = String(email || '').trim();
  if (!e.includes('@')) return false;
  const domain = e.split('@').pop() || '';
  if (!domain) return false;
  return scoreOfficialHost(domain) >= minScore;
};

const COUNTRY_MENTION_ALIASES = {
  'United States': ['US', 'U.S.', 'USA', 'U.S.A.', 'United States of America'],
  'United Kingdom': ['UK', 'U.K.', 'Britain', 'Great Britain'],
  'United Arab Emirates': ['UAE', 'U.A.E.'],
  'South Korea': ['Korea', 'Republic of Korea', 'ROK']
};

const textIncludesCountry = (textLower, countryName) => {
  const name = String(countryName || '').trim();
  if (!name) return false;
  const variants = [name, ...(COUNTRY_MENTION_ALIASES[name] || [])]
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .map((v) => v.toLowerCase());
  return variants.some((v) => textLower.includes(v));
};

const normalizeEmbassyContact = ({ contact, residingCountryName, destinationCountryName, pageText, finalUrl }) => {
  const c = contact && typeof contact === 'object' ? contact : {};
  const name = typeof c.name === 'string' && c.name.trim() ? c.name.trim() : null;
  const address = typeof c.address === 'string' && c.address.trim() ? c.address.trim() : null;
  const phone = typeof c.phone === 'string' && c.phone.trim() ? c.phone.trim() : null;
  const email = typeof c.email === 'string' && c.email.trim() ? c.email.trim() : null;
  const websiteRaw = typeof c.website === 'string' && c.website.trim() ? c.website.trim() : null;

  let finalHost = '';
  let finalScore = 0;
  try {
    finalHost = finalUrl ? new URL(finalUrl).hostname : websiteRaw ? new URL(websiteRaw).hostname : '';
    finalScore = scoreOfficialHost(finalHost);
  } catch {
    finalHost = '';
    finalScore = 0;
  }

  const addressLower = String(address || '').toLowerCase();
  const textLower = String(pageText || '').toLowerCase();

  const mentionsFrom = textIncludesCountry(addressLower, residingCountryName) || textIncludesCountry(textLower, residingCountryName);
  const mentionsTo = textIncludesCountry(textLower, destinationCountryName);
  const mentionsMission = textLower.includes('embassy') || textLower.includes('consulate');

  const website =
    websiteRaw && !isBadSourceHost(finalHost) && (isOfficialUrl(websiteRaw, { minScore: 3 }) || finalScore >= 3) ? websiteRaw : null;

  const hasOfficialSignal = Boolean(website) || isOfficialEmail(email, { minScore: 3 }) || finalScore >= 3;
  const looksLocatedInDestination =
    textIncludesCountry(addressLower, destinationCountryName) && !textIncludesCountry(addressLower, residingCountryName);

  if (!name || !address || !hasOfficialSignal || !mentionsFrom || !mentionsTo || !mentionsMission || looksLocatedInDestination) return null;

  return { name, address, phone: phone || null, email: email || null, website };
};

const normalizeOutputVisaStatus = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (!s) return 'Unknown';
  if (s.includes('visa on arrival')) return 'Visa on Arrival';
  if (s.includes('evisa') || s.includes('e-visa') || s.includes('eta')) return 'eVisa';
  if (s.includes('visa free') || s.includes('visa-free') || s.includes('no visa') || s.includes('without a visa')) return 'Visa-Free';
  if (s.includes('visa required') || s.includes('must obtain a visa') || s.includes('need a visa')) return 'Visa Required';
  return 'Unknown';
};

const visaStatusFromPassportIndexType = (type) => {
  const t = String(type || '').trim();
  if (t === 'Visa-Free') return 'Visa-Free';
  if (t === 'Visa on Arrival') return 'Visa on Arrival';
  if (t === 'e-Visa' || t === 'eTA') return 'eVisa';
  if (t === 'Visa Required') return 'Visa Required';
  return 'Unknown';
};

const fetchOnlineVisaRequirement = async ({ origin, destination }) => {
  const key = process.env.VISA_REQUIREMENT_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
  if (!key) {
    const err = new Error('Online visa provider not configured');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const originCode = await resolveCountryCode(origin);
  const destinationCode = await resolveCountryCode(destination);
  if (!originCode || !destinationCode) {
    const err = new Error('Country not recognized. Use a country name or ISO-2 code.');
    err.code = 'COUNTRY_NOT_RECOGNIZED';
    throw err;
  }

  const url = 'https://visa-requirement.p.rapidapi.com/v2/visa/check';
  const body = JSON.stringify({ passport: originCode, destination: destinationCode });
  const json = await httpsJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'WanderGo/1.0',
      'x-rapidapi-host': 'visa-requirement.p.rapidapi.com',
      'x-rapidapi-key': key
    },
    body,
    timeoutMs: 10000
  });

  const primary = json?.data?.visa_rules?.primary_rule;
  const secondary = json?.data?.visa_rules?.secondary_rule;
  const registration = json?.data?.mandatory_registration;
  const passportValidity = json?.data?.destination?.passport_validity;

  const parts = [
    primary?.name ? `Primary: ${primary.name}${primary.duration ? ` (${primary.duration})` : ''}` : '',
    secondary?.name ? `Secondary: ${secondary.name}${secondary.duration ? ` (${secondary.duration})` : ''}` : '',
    registration?.name ? `Registration: ${registration.name}` : '',
    passportValidity ? `Passport validity: ${passportValidity}` : ''
  ].filter(Boolean);

  const requirement = parts.join('. ') || 'Check official sources for entry requirements.';
  const type = primary?.name || 'Unknown';

  return {
    origin: json?.data?.passport?.name || origin,
    destination: json?.data?.destination?.name || destination,
    requirement,
    type,
    details: {
      source: 'rapidapi',
      passportCode: json?.data?.passport?.code || originCode,
      destinationCode: json?.data?.destination?.code || destinationCode,
      primaryRule: primary || null,
      secondaryRule: secondary || null,
      mandatoryRegistration: registration || null,
      passportValidity: passportValidity || null,
      embassyUrl: json?.data?.destination?.embassy_url || null
    }
  };
};

exports.checkVisa = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    const normalizedOrigin = normalizeCountryInput(origin);
    const normalizedDestination = normalizeCountryInput(destination);

    try {
      const online = await fetchOnlineVisaRequirement({ origin: normalizedOrigin, destination: normalizedDestination });
      return res.json(online);
    } catch { void 0 }

    try {
      const originCode = await resolveCountryCode(normalizedOrigin);
      const destinationCode = await resolveCountryCode(normalizedDestination);
      if (originCode && destinationCode) {
        const dataset = await loadPassportIndexDataset();
        const raw = dataset.rowsByKey.get(`${originCode}|${destinationCode}`) || '';
        if (raw) {
          const formatted = formatRequirementFromPassportIndex(raw);
          return res.json({
            origin: isIso2(normalizedOrigin) ? (await resolveCountryNameFromCode(normalizedOrigin)) || normalizedOrigin : normalizedOrigin,
            destination: isIso2(normalizedDestination)
              ? (await resolveCountryNameFromCode(normalizedDestination)) || normalizedDestination
              : normalizedDestination,
            requirement: formatted.requirement,
            type: formatted.type,
            details: {
              source: 'passport-index-dataset',
              passportCode: originCode,
              destinationCode,
              rawRequirement: raw
            }
          });
        }
      }
    } catch { void 0 }

    try {
      const briefing = await fetchTravelBriefingPayload(normalizedDestination);
      const visaText = extractVisaTextFromTravelBriefing(briefing);
      if (visaText) {
        return res.json({
          origin: normalizedOrigin,
          destination: normalizedDestination,
          requirement: visaText,
          type: 'Info',
          details: { source: 'travelbriefing' }
        });
      }
    } catch { void 0 }

    const rule = visaRules.find((r) =>
      r.origin.toLowerCase() === normalizedOrigin.toLowerCase() &&
      r.destination.toLowerCase() === normalizedDestination.toLowerCase()
    );

    if (rule) return res.json(rule);
    return res.json({
      origin: normalizedOrigin,
      destination: normalizedDestination,
      requirement: 'Online visa requirements are unavailable. Please check the official embassy/consulate.',
      type: 'Unknown'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTravelBriefing = async (req, res) => {
  try {
    const destination = (req.query.destination || '').trim();
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const origin = (req.query.origin || '').trim();
    if (origin) {
      const originCode = await resolveCountryCode(origin);
      const destinationCode = await resolveCountryCode(destination);
      if (!originCode || !destinationCode) {
        return res.status(400).json({ message: 'Origin and destination must be country names or ISO-2 codes.' });
      }
      let embassy = null;
      try {
        embassy = await fetchEmbassyFromWikidata({ originCode: destinationCode, destinationCode: originCode });
      } catch { void 0 }
      return res.json({
        destination,
        data: {
          embassy: embassy
            ? {
                name: embassy.name,
                address: embassy.address,
                telephone: embassy.telephone,
                email: embassy.email,
                web: embassy.web,
                details: embassy.details
              }
            : null
        }
      });
    }

    const payload = await fetchTravelBriefingPayload(destination);
    res.json({ destination, data: payload });
  } catch (err) {
    const message =
      err?.message === 'Request timed out' || err?.message === 'TravelBriefing request timed out'
        ? 'Travel briefing provider timed out'
        : 'Failed to fetch travel briefing';
    res.status(502).json({ message, error: err.message });
  }
};

exports.getTravelInfo = async (req, res) => {
  try {
    const from = (req.query.from || req.query.origin || '').trim();
    const to = (req.query.to || req.query.destination || '').trim();
    const nationality = (req.query.nationality || req.query.passport || from || '').trim();

    if (!from || !to) {
      return res.status(400).json({
        route: { from: from || null, to: to || null, residing_country: from || null, nationality: nationality || null },
        visa_requirements: { status: 'Unknown', duration: null, details: 'Route is required.', confidence: 'Low' },
        embassy_contacts: []
      });
    }

    const fromNorm = normalizeCountryInput(from);
    const toNorm = normalizeCountryInput(to);
    const nationalityNorm = normalizeCountryInput(nationality || fromNorm);

    const [fromCode, toCode, nationalityCode] = await Promise.all([
      resolveCountryCode(fromNorm),
      resolveCountryCode(toNorm),
      resolveCountryCode(nationalityNorm)
    ]);

    const [fromName, toName, nationalityName] = await Promise.all([
      fromCode ? resolveCountryNameFromCode(fromCode) : null,
      toCode ? resolveCountryNameFromCode(toCode) : null,
      nationalityCode ? resolveCountryNameFromCode(nationalityCode) : null
    ]);

    const route = {
      from: fromName || fromNorm,
      to: toName || toNorm,
      residing_country: fromName || fromNorm,
      nationality: nationalityName || nationalityNorm
    };

    let visa_requirements = {
      status: 'Unknown',
      duration: null,
      details: 'Unable to confirm visa requirements from official sources.',
      confidence: 'Low'
    };

    try {
      if (nationalityCode && toCode) {
        const dataset = await loadPassportIndexDataset();
        const raw = dataset.rowsByKey.get(`${nationalityCode}|${toCode}`) || '';
        if (raw) {
          const formatted = formatRequirementFromPassportIndex(raw);
          const duration = extractMaxStayDays(formatted.requirement) || extractMaxStayDays(raw);
          const datasetDetected = normalizeOutputVisaStatus(classifyVisaStatusFromText(`${formatted.requirement} ${raw}`) || '');
          const datasetStatus =
            visaStatusFromPassportIndexType(formatted.type) !== 'Unknown'
              ? visaStatusFromPassportIndexType(formatted.type)
              : datasetDetected !== 'Unknown'
                ? datasetDetected
                : 'Unknown';
          visa_requirements = {
            status: datasetStatus,
            duration: duration || null,
            details: formatted.requirement,
            confidence: 'Medium'
          };
        }
      }
    } catch { void 0 }

    try {
      const page = await bestOfficialPageForQuery(`${route.to} visa requirements for ${route.nationality} citizens`, { minScore: 5 });
      if (page && page.text) {
        const detected = classifyVisaStatusFromText(page.text);
        const status = normalizeOutputVisaStatus(detected || '');
        const duration = extractMaxStayDays(page.text);

        visa_requirements = {
          status: status !== 'Unknown' ? status : 'Unknown',
          duration: duration || null,
          details:
            status !== 'Unknown'
              ? `${status}${duration ? ` for ${duration} days` : ''}.`
              : 'Official sources found but the requirement is unclear.',
          confidence: status !== 'Unknown' ? 'High' : 'Low'
        };
      }
    } catch { void 0 }

    const embassy_contacts = [];

    const upsertEmbassyContact = (candidate) => {
      const c = candidate && typeof candidate === 'object' ? candidate : null;
      if (!c) return;
      if (!c.name && !c.address && !c.phone && !c.email && !c.website) return;

      const normalizeKey = (v) => String(v || '').trim().toLowerCase();
      const websiteKey = c.website ? normalizeKey(c.website) : '';
      const addressKey = c.address ? normalizeKey(c.address) : '';

      let target = null;
      if (websiteKey) target = embassy_contacts.find((x) => x.website && normalizeKey(x.website) === websiteKey) || null;
      if (!target && addressKey) target = embassy_contacts.find((x) => x.address && normalizeKey(x.address) === addressKey) || null;

      if (!target) {
        embassy_contacts.push(c);
        return;
      }

      if (!target.name && c.name) target.name = c.name;
      if (!target.address && c.address) target.address = c.address;
      if (!target.phone && c.phone) target.phone = c.phone;
      if (!target.email && c.email) target.email = c.email;
      if (!target.website && c.website) target.website = c.website;
    };

    try {
      const wikidataMissions = await fetchEmbassyContactsFromWikidataCountries({
        residingCountryName: route.residing_country,
        destinationCountryName: route.to
      });
      for (const m of wikidataMissions) {
        if (embassy_contacts.length >= 4) break;
        const obj = m && typeof m === 'object' ? m : {};
        const normalized = {
          name: typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : null,
          address: typeof obj.address === 'string' && obj.address.trim() ? obj.address.trim() : null,
          phone: typeof obj.phone === 'string' && obj.phone.trim() ? obj.phone.trim() : null,
          email: typeof obj.email === 'string' && obj.email.trim() ? obj.email.trim() : null,
          website: typeof obj.website === 'string' && obj.website.trim() ? obj.website.trim() : null
        };
        upsertEmbassyContact(normalized);
      }
    } catch { void 0 }

    const hasAnyDetails = embassy_contacts.some((c) => c && (c.address || c.phone || c.email));

    if (embassy_contacts.length === 0 || !hasAnyDetails) {
      const embassyQueries = [
        { label: `Embassy of ${route.to} in ${route.from}`, minScore: 3 },
        { label: `Consulate of ${route.to} in ${route.from}`, minScore: 3 },
        { label: `${route.to} consulate ${route.from}`, minScore: 3 }
      ];

      for (const q of embassyQueries) {
        if (embassy_contacts.length >= 4) break;
        try {
          const page = await bestOfficialPageForQuery(`${q.label} contact address phone email`, { minScore: q.minScore });
          if (!page || !page.text) continue;
          const extracted = extractEmbassyContactsFromPage({ text: page.text, finalUrl: page.finalUrl, fallbackName: q.label });
          const normalized = normalizeEmbassyContact({
            contact: extracted,
            residingCountryName: route.residing_country,
            destinationCountryName: route.to,
            pageText: page.text,
            finalUrl: page.finalUrl
          });
          if (!normalized) continue;
          upsertEmbassyContact(normalized);
        } catch { void 0 }
      }
    }

    res.json({ route, visa_requirements, embassy_contacts });
  } catch {
    res.status(500).json({
      route: { from: null, to: null, residing_country: null, nationality: null },
      visa_requirements: { status: 'Unknown', duration: null, details: 'Server error while fetching travel info.', confidence: 'Low' },
      embassy_contacts: []
    });
  }
};

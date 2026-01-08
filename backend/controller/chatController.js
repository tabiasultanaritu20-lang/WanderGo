const Spot = require('../model/spotModel');
const Package = require('../model/packageModel');
const Blog = require('../model/Blog');

const buildFallbackReply = async (msg) => {
  const text = (msg || '').toLowerCase();
  const bullets = [];
  const lines = [];

  // Try spots by city/country/name keywords
  const locationMatch = text.match(/\b([a-zA-Z\s]+)\b/);
  const keywords = [];
  if (text.includes('paris')) keywords.push('paris');
  if (text.includes('france')) keywords.push('france');
  if (text.includes('london')) keywords.push('london');
  if (text.includes('tokyo')) keywords.push('tokyo');
  if (text.includes('bali')) keywords.push('bali');
  if (locationMatch) {
    const k = locationMatch[1].trim();
    if (k.length >= 3) keywords.push(k);
  }

  const spotQuery = keywords.length
    ? {
        $or: [
          { city: { $regex: keywords.join('|'), $options: 'i' } },
          { country: { $regex: keywords.join('|'), $options: 'i' } },
          { name: { $regex: keywords.join('|'), $options: 'i' } },
        ],
      }
    : {};

  const foundSpots = await Spot.find(spotQuery).limit(6);
  if (foundSpots.length) {
    const locationLabel =
      keywords.find(k => ['paris', 'france', 'london', 'tokyo', 'bali'].includes(k)) ||
      (foundSpots[0].city || foundSpots[0].country || 'these locations');
    lines.push(`Here are a few spots in ${locationLabel}:`);
    lines.push('');
    foundSpots.forEach(s => {
      const desc = (s.description || '').trim();
      const snippet = desc ? (desc.length > 140 ? desc.slice(0, 140) + '...' : desc) : '';
      bullets.push(`• ${s.name}${s.city ? ` — ${s.city}, ${s.country}` : s.country ? ` — ${s.country}` : ''}${snippet ? `: ${snippet}` : ''}`);
    });
    lines.push(...bullets);
    lines.push('');
    lines.push('Want to explore more? Visit /spots');
    return lines.join('\n');
  }

  // Try packages by location keywords
  const pkgQuery = keywords.length
    ? {
        $or: [
          { destinationCity: { $regex: keywords.join('|'), $options: 'i' } },
          { destinationCountry: { $regex: keywords.join('|'), $options: 'i' } },
          { title: { $regex: keywords.join('|'), $options: 'i' } },
        ],
      }
    : {};
  const foundPackages = await Package.find(pkgQuery).limit(6);
  if (foundPackages.length) {
    lines.push('Here are some packages that might fit:');
    lines.push('');
    foundPackages.forEach(p => {
      const price = typeof p.price === 'number' ? `$${p.price}` : 'Price on request';
      bullets.push(`• ${p.title} — ${price} | ${p.destinationCity}, ${p.destinationCountry}`);
    });
    lines.push(...bullets);
    lines.push('');
    lines.push('You can view details and book here: /packages');
    return lines.join('\n');
  }

  // Fallback general help
  return [
    'I can help you with travel spots, packages, visa info, and safety.',
    '',
    'Try asking things like:',
    '• Show me popular spots in Paris',
    '• What tour packages do you have for Bali?',
    '• How do I apply for a Japan visa?',
    '',
    'You can also browse:',
    '• Spots: /spots',
    '• Packages: /packages',
    '• Visa & Docs: /visa-docs',
    '• Emergency: /emergency',
    '• Blogs: /blogs',
  ].join('\n');
};

const buildSiteContext = async (msg) => {
  const lower = (msg || '').toLowerCase();
  
  // Fetch data concurrently from DB
  const [spots, packages, blogs] = await Promise.all([
    Spot.find().sort({ createdAt: -1 }).limit(6),
    Package.find().sort({ createdAt: -1 }).limit(6),
    Blog.find().sort({ createdAt: -1 }).limit(4)
  ]);

  const lines = [];
  lines.push('--- REAL-TIME SITE DATA ---');
  
  // SPOTS
  if (spots.length > 0) {
    lines.push('\n[Available Spots]');
    spots.forEach(s => {
      const desc = (s.description || '').substring(0, 120) + '...';
      lines.push(`• ${s.name} (${s.city}, ${s.country}): ${desc}`);
    });
  }

  // PACKAGES
  if (packages.length > 0) {
    lines.push('\n[Tour Packages]');
    packages.forEach(p => {
      lines.push(`• ${p.title}: $${p.price} | ${p.destinationCity}, ${p.destinationCountry}`);
    });
  }

  // BLOGS
  if (blogs.length > 0) {
    lines.push('\n[Latest Blogs]');
    blogs.forEach(b => {
      lines.push(`• ${b.title} by ${b.authorName} (${b.location})`);
    });
  }

  lines.push('\n[Navigation Routes]');
  lines.push('Home: /');
  lines.push('Spots: /spots');
  lines.push('Packages: /packages');
  lines.push('Visa & Docs: /visa-docs');
  lines.push('Emergency: /emergency');
  lines.push('Blogs: /blogs');
  
  lines.push('\n[Instructions]');
  lines.push('Use the data above to answer questions. If a user asks for a specific spot or package listed here, provide the details. When suggesting browsing, reference routes plainly like /spots or /packages.');
  
  return lines.join('\n');
};

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const contents = [];
    const systemPrompt = `You are "Travel Advisor", a friendly, enthusiastic, and knowledgeable travel companion for WanderGo. Your goal is to inspire and assist users with travel destinations, visa requirements, booking tours, and general travel tips. Speak naturally and conversationally, like a helpful human travel agent. Be warm, encouraging, and personalized in your responses. Avoid robotic phrasing. Do NOT use Markdown tables, charts, or complex formatting. Do NOT use Markdown headers (#). Write in plain, conversational text with short paragraphs separated by blank lines. If you need to list items, use simple unicode bullets (•). Never output raw data structures or pipe-delimited tables. Add emojis sparingly where they enhance clarity or warmth.`;

    if (history && Array.isArray(history)) {
      history.forEach((msg, index) => {
        if (!msg.content) return;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      });
    }

    const siteContext = await buildSiteContext(message);
    const contextAwareContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "I understand. I am ready to be the Travel Advisor." }] },
      { role: 'user', parts: [{ text: siteContext }] },
      ...contents,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contextAwareContents
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      const fallback = await buildFallbackReply(message);
      return res.json({ reply: fallback });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't process that request. Could you please rephrase it?";

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error('Chat Controller Error:', err);
    const { message } = req.body || {};
    try {
      const fallback = await buildFallbackReply(message);
      return res.json({ reply: fallback });
    } catch (inner) {
      return res.status(500).json({ message: 'Server error processing chat' });
    }
  }
};

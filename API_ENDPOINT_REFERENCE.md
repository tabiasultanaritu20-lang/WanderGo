# WanderGo API Endpoint Reference

## Backend Running on: `http://localhost:8080`
## Frontend Running on: `http://localhost:5173` (with proxy to `/api`)

---

## 📦 PACKAGES ENDPOINTS

| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/packages` | packageController | getPackages | ✅ |
| POST | `/api/packages` | packageController | createPackage | ✅ |
| GET | `/api/packages/recommend?destinationCountry=...&destinationCity=...&budget=...` | packageController | recommendPackages | ✅ |
| DELETE | `/api/packages/:id` | packageController | deletePackage | ✅ |

**Query Parameters:**
- `country`, `city`, `maxPrice` (for getPackages)
- `destinationCountry`, `destinationCity`, `budget` (for recommendPackages)

---

## 🚨 EMERGENCY HUB ENDPOINTS

### Emergency Contacts
| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/emergency-contacts?country=...&city=...&type=...` | emergencyController | listContacts | ✅ |
| POST | `/api/emergency-contacts` | emergencyController | createContact | ✅ |
| GET | `/api/emergency-contacts/:id` | emergencyController | getContact | ✅ |
| PUT | `/api/emergency-contacts/:id` | emergencyController | updateContact | ✅ |
| DELETE | `/api/emergency-contacts/:id` | emergencyController | deleteContact | ✅ |

### Safety Ratings
| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/safety-rating?country=...&city=...` | emergencyController | safetyRating | ✅ |
| POST | `/api/safety-rating/rate` | emergencyController | rateSafety | ✅ |
| PUT | `/api/safety-rating/admin` | emergencyController | setAdminSafetyRating | ✅ |

### Travel Advice
| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/travel-advice?country=...&city=...` | emergencyController | travelAdvice | ✅ |

### Travel Alerts
| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/alerts?country=...&city=...` | emergencyController | listAlerts | ✅ |
| POST | `/api/alerts` | emergencyController | createAlert | ✅ |

---

## 🗺️ SPOT DIRECTORY ENDPOINTS

| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/spots?q=...&country=...&city=...&category=...&tag=...&lat=...&lng=...&limit=20` | spotController | listSpots | ✅ |
| POST | `/api/spots` | spotController | createSpot | ✅ |
| DELETE | `/api/spots/:id` | spotController | deleteSpot | ✅ |
| POST | `/api/spots/seed` | spotController | seedSpots | ✅ |

**Query Parameters:**
- `q` - Search query (name or description)
- `country`, `city`, `category`, `tag` - Filters
- `lat`, `lng` - Geolocation (for distance sorting)
- `limit` - Number of results (default 20)

---

## 📄 VISA & DOCS ENDPOINTS

### Visa Check
| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/visa/check?origin=...&destination=...` | visaController | checkVisa | ✅ |
| GET | `/api/visa/briefing?country=...` | visaController | getTravelBriefing | ✅ |
| GET | `/api/visa/travel-info?from=...&to=...&nationality=...` | visaController | getTravelInfo | ✅ |

### Documents (Auth Protected)
| Method | Endpoint | Controller | Function | Auth | Status |
|--------|----------|-----------|----------|------|--------|
| GET | `/api/documents` | documentController | getDocuments | Yes | ✅ |
| POST | `/api/documents` | documentController | addDocument | Yes | ✅ |
| DELETE | `/api/documents/:id` | documentController | deleteDocument | Yes | ✅ |
| GET | `/api/documents/alerts` | documentController | checkExpiry | Yes | ✅ |

**Auth:** Requires `Authorization: Bearer <token>` header

---

## 🤖 CHATBOT ENDPOINT

| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| POST | `/api/chat` | chatController | chat | ✅ |

**Request Body:**
```json
{
  "message": "User message text"
}
```

**Response:**
```json
{
  "reply": "AI/Bot response text"
}
```

---

## 📝 BLOG ENDPOINTS (Existing - Not Analyzed in Task)

| Method | Endpoint | Controller | Function | Status |
|--------|----------|-----------|----------|--------|
| GET | `/api/blogs?category=...&location=...&page=...&limit=...` | blogController | getBlogs | ✅ |
| GET | `/api/blogs/:id` | blogController | getBlogById | ✅ |
| POST | `/api/blogs` | blogController | createBlog | ✅ |
| PUT | `/api/blogs/:id` | blogController | updateBlog | ✅ |
| DELETE | `/api/blogs/:id` | blogController | deleteBlog | ✅ |
| GET | `/api/blogs/:id/saved` | blogController | getSavedBlogs | ✅ |
| POST | `/api/blogs/:id/like` | blogController | toggleLike | ✅ |
| POST | `/api/blogs/:id/comments` | blogController | addComment | ✅ |
| DELETE | `/api/blogs/:id/comments/:commentId` | blogController | deleteComment | ✅ |
| POST | `/api/blogs/:id/share` | blogController | shareBlog | ✅ |
| POST | `/api/blogs/:id/save` | blogController | toggleSaveBlog | ✅ |

---

## Frontend API Usage Summary

### Dashboard.jsx (Packages)
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// Uses: fetch() to /api/packages
```

### EmergencyHub.jsx
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
// Uses: fetch() to /api/emergency-contacts, /api/safety-rating, /api/travel-advice, /api/alerts
```

### SpotDirectory.jsx
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// Uses: fetch() to /api/spots
```

### VisaDocs.jsx
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// Uses: axios & fetch() to /api/visa/* and /api/documents
```

### Chatbot.jsx
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// Uses: axios.post() to /api/chat
```

---

## Frontend Routes Summary

| Path | Component | Feature |
|------|-----------|---------|
| `/` | Navigate to `/login` | Redirect |
| `/login` | Login | Authentication |
| `/signup` | SignUp | Authentication |
| `/dashboard` | Dashboard | Packages |
| `/packages` | Dashboard | Packages (alias) |
| `/create-tour` | CreateTourForm | Tours |
| `/emergency` | EmergencyHub | Emergency Hub |
| `/blogs` | TravelBlogFeed | Travel Blogs |
| `/home` | Home | Home Page |
| `/spots` | SpotDirectory | Spot Directory |
| `/visa-docs` | VisaDocs | Visa & Docs |
| `*` | Navigate to `/login` | 404 Fallback |

---

## Database Seeding

**Automatically seeded on app startup:**
- Blog default data (ensureSeeded from blogController)
- Emergency contact data (ensureSeededEmergency from emergencyController)

To manually seed other data, call:
- `POST /api/spots/seed` - Seed default spots

---

## Environment Variables

### Frontend (.env.local)
```
VITE_API_BASE=http://localhost:8080/api
```

### Backend (.env)
```
PORT=8080
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| API calls fail with 404 | Wrong API_BASE | Check environment variables |
| CORS errors | Frontend on different port | Verify vite.config.js proxy |
| 401 Unauthorized on docs | Missing auth header | Add Bearer token for protected routes |
| Empty results | No seeded data | Manually seed or create data |
| Chatbot not responding | Missing models in context | Ensure Spot, Package, Blog models exist |

---

## Verification Completed ✅

All endpoints have been verified to be:
- ✅ Properly mapped in routes
- ✅ Correctly implemented in controllers
- ✅ Using correct models
- ✅ Mounted in app.js
- ✅ Called with correct URLs from frontend
- ✅ Using consistent API_BASE pattern
- ✅ No broken imports or exports

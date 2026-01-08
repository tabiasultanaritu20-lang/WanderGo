# WanderGo Project - Presentation Guide
## Packages Tab & Spot Directory Tab

---

## 📋 OVERVIEW

The WanderGo application consists of two complementary features:
1. **Packages Tab** - Pre-designed travel packages with pricing and destinations
2. **Spot Directory Tab** - A searchable directory of tourist attractions and landmarks

Both features work together to help users discover travel experiences and plan their journeys.

---

# 🎫 PACKAGES TAB

## 📱 FRONTEND STRUCTURE

### File: `frontend/src/pages/CreateTourForm.jsx`

**Purpose**: This component allows travel agencies to create and manage travel packages.

#### Key Components:

1. **Authentication Check**
   - Verifies user is logged in via JWT token
   - Extracts agency ID from token
   - Prevents unauthorized access

2. **Form Fields** (what users enter):
   - **Title** - Name of the package (e.g., "Summer Adventure in Paris")
   - **Destination Country** - Where the package goes
   - **Destination City** - Specific city
   - **Start Date** - When the package begins
   - **End Date** - When the package ends
   - **Price Per Person** - Cost per traveler
   - **Max Group Size** - Maximum number of people
   - **Description** - Detailed description of the package
   - **Image URL** - Photo/banner for the package
   - **Active Status** - Toggle to activate/deactivate the package

3. **Form Submission Flow**:
   ```
   User fills form → Validates required fields → 
   Sends POST request to backend → Package created in database → 
   Success message shown
   ```

4. **API Endpoint Used**:
   ```
   POST http://192.168.10.191:8080/api/tours/{agencyId}/tours
   Headers: Authorization: Bearer {token}
   ```

---

## 🔧 BACKEND STRUCTURE - PACKAGES

### File: `backend/model/packageModel.js`

**Database Schema** - What data is stored:

```javascript
{
  title: String,              // Package name
  features: [String],         // List of included features
  price: Number,              // Price per person (minimum 0)
  destinationCountry: String, // From enum of 195+ countries
  destinationCity: String,    // Specific city
  imageUrl: String,           // Photo URL
  timestamps: true            // Automatic createdAt & updatedAt
}
```

**Key Feature**: The model validates that `destinationCountry` is a real country from a predefined list of 195+ countries.

---

### File: `backend/controller/packageController.js`

**Three Main Functions**:

#### 1️⃣ **createPackage** (POST)
- **What it does**: Creates a new travel package
- **Validates**: title, price, destinationCountry, destinationCity (required)
- **Returns**: Created package object with ID
- **Response**: `{ message: "Package created", data: {...} }`

#### 2️⃣ **getPackages** (GET)
- **What it does**: Retrieves all packages with optional filters
- **Query Parameters**:
  - `country` - Filter by destination country
  - `city` - Filter by destination city (case-insensitive search)
  - `maxPrice` - Show packages under this price
- **Returns**: Array of matching packages sorted by newest first
- **Example**: `/api/packages?country=France&maxPrice=5000`

#### 3️⃣ **recommendPackages** (GET)
- **What it does**: Recommends packages based on destination and budget
- **Query Parameters**:
  - `destinationCountry` - Required or city
  - `destinationCity` - Required or country
  - `budget` - Optional budget limit
- **Smart Sorting**: If budget provided, sorts by closest match to budget
- **Returns**: Recommendations array with destination and budget info
- **Example**: `/api/packages/recommend?destinationCountry=Italy&budget=3000`

---

### File: `backend/route/packageRoutes.js`

**Available Endpoints**:

```
GET  /api/packages              → getPackages (with filters)
POST /api/packages              → createPackage
GET  /api/packages/recommend    → recommendPackages
```

---

# 🗺️ SPOT DIRECTORY TAB

## 📱 FRONTEND STRUCTURE

### File: `frontend/src/pages/SpotDirectory.jsx`

**Purpose**: Interactive directory to discover tourist spots with filtering and search capabilities.

#### Key Features:

1. **Search Filters** (in left sidebar):
   - **General Search** (`q`) - Searches spot name and description
   - **Country** - Filter by destination country
   - **City** - Filter by city
   - **Category** - Filter by type (Beach, Hill, Landmark, etc.)
   - **Tag** - Filter by specific tags (sea, beach, valley, etc.)
   - Real-time search with 300ms debounce

2. **Add New Spot** Feature:
   - Toggle "Add spot" button to show form
   - Input fields:
     - Name, Country, City
     - Category (what type of attraction)
     - Tags (comma-separated, e.g., "beach,sea,scenic")
     - Photo URL
     - Description (full details)
     - Latitude & Longitude (for map integration)
   - Creates spot on backend when saved

3. **Display Grid**:
   - Shows spots in responsive 1-2 column layout
   - Each card displays:
     - Photo (first photo in array)
     - Name & location
     - Description (truncated)
     - Category
     - Tags as clickable filters
     - Google Maps link (if coordinates available)
   - Hover effect for visual feedback

4. **Modal View**:
   - Click any spot to see full details
   - Shows:
     - Full image
     - Complete description
     - All tags
     - Full location info
     - Google Maps link
     - Last updated timestamp

5. **Data Flow**:
   ```
   User enters filters → Debounced fetch (300ms wait) → 
   API call with all filters → Receive spot array → 
   Display in grid → Click to see full modal
   ```

6. **API Used**:
   ```
   GET http://192.168.10.191:8080/api/spots?q=search&country=...&city=...
   POST http://192.168.10.191:8080/api/spots (to add new spot)
   ```

---

## 🔧 BACKEND STRUCTURE - SPOTS

### File: `backend/model/spotModel.js`

**Database Schema** - What data is stored:

```javascript
{
  name: String,        // Spot name (required, trimmed)
  description: String, // Details about the spot
  photos: [String],    // Array of photo URLs
  country: String,     // Country (required)
  city: String,        // City name
  category: String,    // Type (Beach, Hill, Landmark, etc.)
  tags: [String],      // Array of tags for filtering
  lat: Number,         // Latitude for maps
  lng: Number,         // Longitude for maps
  timestamps: true     // Automatic createdAt & updatedAt
}
```

---

### File: `backend/controller/spotController.js`

**Four Main Functions**:

#### 1️⃣ **listSpots** (GET)
- **What it does**: Retrieves spots with advanced filtering and sorting
- **Query Parameters**:
  - `q` - Search query (searches name + description)
  - `country` - Exact match by country
  - `city` - Exact match by city
  - `category` - Exact match by category
  - `tag` - Filter by single tag
  - `lat` & `lng` - Optional coordinates to sort by distance
  - `limit` - Max results (default: 20)
- **Smart Distance Sorting**: If coordinates provided, sorts results by Manhattan distance to that point
- **Returns**: Array of matching spots

#### 2️⃣ **createSpot** (POST)
- **What it does**: Adds a new tourist spot to database
- **Required Fields**: name, country (description, photos, lat, lng optional)
- **Returns**: Created spot object with generated ID
- **Response**: `{ message: "created", data: {...} }`

#### 3️⃣ **seedSpots** (POST)
- **What it does**: Populates database with sample tourist spots
- **Includes**: Cox's Bazar Beach, Sajek Valley, Golden Gate Bridge, etc.
- **Protection**: Only works if database is empty
- **Returns**: Array of created seed spots
- **Used for**: Demo purposes

#### 4️⃣ **Distance-Based Sorting**
- Uses Manhattan distance formula: `|lat_diff| + |lng_diff|`
- Sorts results closest to provided coordinates first
- Useful for "find nearby spots" feature

---

### File: `backend/route/spotRoutes.js`

**Available Endpoints**:

```
GET  /api/spots              → listSpots (with filters + sorting)
POST /api/spots              → createSpot
POST /api/spots/seed         → seedSpots
```

---

# 🔄 DATA FLOW COMPARISON

## PACKAGES Flow:
```
User (Agency) 
  ↓
Creates Tour Package via CreateTourForm
  ↓
POST /api/tours/{agencyId}/tours
  ↓
Backend: packageController.createPackage
  ↓
Stores in Package Database
  ↓
Returns confirmation
```

## SPOTS Flow:
```
User
  ↓
Searches/Filters in Spot Directory
  ↓
GET /api/spots?country=...&city=...
  ↓
Backend: spotController.listSpots
  ↓
Applies filters, optional distance sorting
  ↓
Returns matching spots
  ↓
Frontend renders grid + allows adding new spots
```

---

# 🎯 PRESENTATION TALKING POINTS

## For Packages Tab:
1. **Purpose**: Travel agencies can create curated travel packages with fixed dates, prices, and group sizes
2. **Filtering**: Customers can search by destination country, city, or price range
3. **Smart Recommendations**: Algorithm matches user budget to closest priced packages
4. **Data Validation**: Country list validated against 195+ countries for data quality
5. **Agency Control**: Only authenticated agencies can create packages

## For Spot Directory Tab:
1. **Discovery Tool**: Users can explore tourist attractions worldwide
2. **Advanced Filtering**: 5 types of filters (search, country, city, category, tag)
3. **Community Driven**: Any user can add new spots to the directory
4. **Real-time Search**: Debounced search prevents server overload
5. **Location Integration**: Google Maps links for coordinates
6. **Smart Sorting**: Nearby spots can be found using distance calculation

---

# 🖥️ DEMO FLOW SUGGESTION

### Part 1: Packages
```
1. Show package database schema
2. Demonstrate createPackage with form submission
3. Show filtering by country/price
4. Demo recommendation engine with budget parameter
5. Explain validation and enum countries
```

### Part 2: Spot Directory
```
1. Show initial loaded spots (seed data)
2. Demonstrate each filter type (search, country, city, category, tag)
3. Show real-time response with debounce
4. Add a new spot manually via form
5. Click spot to see modal details
6. Show Google Maps integration with coordinates
7. Explain distance sorting algorithm
```

---

# 📊 KEY STATISTICS

| Feature | Packages | Spots |
|---------|----------|-------|
| **Create Operation** | Yes (agencies) | Yes (any user) |
| **Read Operation** | Yes (with filters) | Yes (with filters) |
| **Update Operation** | Not visible | Not visible |
| **Delete Operation** | Not visible | Not visible |
| **Search Fields** | country, city, price | name, description, all fields |
| **Sorting** | by newest created | by distance (if coords) |
| **Validation** | country enum | basic required fields |
| **Authentication** | Required | Not required (create) |

---

# 🚀 ADVANCED FEATURES MENTIONED

1. **JWT Authentication** (Packages): Users identified by decoded token
2. **Debounced Search** (Spots): 300ms delay prevents excessive API calls
3. **Distance Algorithm** (Spots): Manhattan distance for location-based sorting
4. **Regular Expression Search** (Both): Case-insensitive pattern matching
5. **Modal Interface** (Spots): Overlay for detailed information
6. **External API Integration** (Spots): Google Maps embedding

---

# 📝 NOTES FOR Q&A

- **Q: Why are packages authentication required but spots not?**
  - A: Packages are business offerings (agencies create), spots are community content

- **Q: How does the distance sorting work?**
  - A: Uses Manhattan distance formula to find nearby attractions

- **Q: Can users edit packages they created?**
  - A: Current implementation shows create only; edit/delete not visible in code

- **Q: What happens if someone adds duplicate spots?**
  - A: Database allows duplicates (no unique constraint on names)

- **Q: Why 300ms debounce for search?**
  - A: Balance between responsiveness and server load reduction

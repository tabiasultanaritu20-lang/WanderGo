# WanderGo Testing & Verification Checklist

## Pre-Launch Checklist

### ✅ Merge Conflicts
- [x] backend/app.js - RESOLVED
- [x] frontend/vite.config.js - RESOLVED  
- [x] frontend/src/App.jsx - RESOLVED
- [x] frontend/src/pages/EmergencyHub.jsx - RESOLVED
- [x] backend/controller/blogController.js - RESOLVED (in previous task)

### ✅ Backend Verification
- [x] All models exist and are exported
  - User, Blog, Document, Emergency, Package, Spot, Tour models
- [x] All controllers exist and import models correctly
  - blog, package, spot, visa, document, emergency, chat controllers
- [x] All routes exist and are properly exported
  - user, blog, package, spot, visa, document, emergency, safety, chat, tour, upload routes
- [x] app.js properly imports and mounts all routers
- [x] CORS is properly configured
- [x] Database middleware is initialized
- [x] Seeding functions are called on startup

### ✅ Frontend Verification
- [x] All pages exist and are imported in App.jsx
  - Dashboard, EmergencyHub, SpotDirectory, VisaDocs, Home, TravelBlogFeed
- [x] All routes are properly defined in App.jsx
  - 12 routes + 404 fallback
- [x] Chatbot component is mounted globally
- [x] NavTabs component is mounted globally
- [x] All API calls use proper API_BASE pattern
- [x] vite.config.js has proper proxy configuration
- [x] baseApi utility exists and is properly configured

### ✅ Feature Implementation
- [x] Packages: CRUD operations fully implemented
- [x] Emergency Hub: Contacts, ratings, alerts fully implemented
- [x] Spot Directory: Search, filter, geolocation fully implemented
- [x] Visa & Docs: Visa check, document management fully implemented
- [x] Chatbot: Message processing with context fully implemented

---

## Integration Testing Guide

### 1. PACKAGES FEATURE

**Setup:** Navigate to `/packages` or `/dashboard`

**Test Cases:**

1. **Load Packages**
   - [ ] Page loads without errors
   - [ ] Existing packages display in grid
   - [ ] Filter by price slider works
   - [ ] Filter by duration works
   - [ ] Filter by tags works
   - [ ] Pagination works correctly

2. **Create Package**
   - [ ] Click "Add Package" button
   - [ ] Form appears with all fields
   - [ ] Submit with valid data
   - [ ] New package appears in list
   - [ ] Error handling for missing fields

3. **Delete Package**
   - [ ] Click delete button on package
   - [ ] Confirm dialog appears
   - [ ] Package removed from list after confirmation
   - [ ] Page updates without full refresh

4. **Rate Package**
   - [ ] Click star rating component
   - [ ] Rating updates immediately
   - [ ] Rating persists on reload

---

### 2. EMERGENCY HUB FEATURE

**Setup:** Navigate to `/emergency`

**Test Cases:**

1. **Load Emergency Data**
   - [ ] Page loads without errors
   - [ ] Default location (BD, Dhaka) loads contacts
   - [ ] Safety rating displays for location
   - [ ] Travel advice appears
   - [ ] Travel alerts list appears

2. **Search Contacts**
   - [ ] Change country to "United States"
   - [ ] Change city to "New York"
   - [ ] Contacts update for new location
   - [ ] Contact count is correct
   - [ ] Contact details display (type, phone, address)

3. **Add Contact**
   - [ ] Click "Add Emergency Contact" button
   - [ ] Form appears with type selector
   - [ ] Submit new contact
   - [ ] Contact appears in list
   - [ ] Form clears after submission

4. **Delete Contact**
   - [ ] Click delete button on contact
   - [ ] Contact removed immediately
   - [ ] No confirmation dialog needed
   - [ ] List updates

5. **Rate Safety**
   - [ ] Adjust rating slider (1-10)
   - [ ] Click "Submit" button
   - [ ] Rating is saved
   - [ ] Safety rating display updates

6. **Travel Alerts**
   - [ ] View current alerts for location
   - [ ] Add new alert with severity
   - [ ] Set date range
   - [ ] Alert appears in list
   - [ ] Can view multiple alerts

---

### 3. SPOT DIRECTORY FEATURE

**Setup:** Navigate to `/spots`

**Test Cases:**

1. **Load Spots**
   - [ ] Page loads without errors
   - [ ] Default spots load in list/map
   - [ ] Spot cards display with image, name, description

2. **Search Spots**
   - [ ] Type search term (e.g., "beach")
   - [ ] Results filter in real-time
   - [ ] Clear search returns all results

3. **Filter Spots**
   - [ ] Filter by country (Bangladesh)
   - [ ] Filter by city (Cox's Bazar)
   - [ ] Filter by category (Beach)
   - [ ] Filter by tag
   - [ ] Multiple filters work together

4. **Geolocation**
   - [ ] Provide latitude/longitude
   - [ ] Spots sort by distance
   - [ ] Distance displayed on cards

5. **Add Spot**
   - [ ] Click "Add New Spot" button
   - [ ] Form appears with all fields
   - [ ] Submit valid spot data
   - [ ] Spot appears in list
   - [ ] Tags are properly parsed

6. **Delete Spot**
   - [ ] Click delete button on spot
   - [ ] Spot removed from list
   - [ ] List updates without refresh

7. **Modal Details**
   - [ ] Click on spot to open modal
   - [ ] Modal displays full details
   - [ ] Photos/gallery displays if available
   - [ ] Close button works

---

### 4. VISA & DOCS FEATURE

**Setup:** Navigate to `/visa-docs`

**Test Cases:**

1. **Visa Tab**
   - [ ] Tab switches to visa panel
   - [ ] Two input fields appear (origin, destination)
   - [ ] Type country names (e.g., "Bangladesh", "United States")
   - [ ] Click "Check Visa"
   - [ ] Result displays visa requirement
   - [ ] Different country combinations show different results

2. **Travel Info**
   - [ ] Get briefing for a country
   - [ ] Get travel info displays relevant data
   - [ ] External API calls work properly

3. **Documents Tab**
   - [ ] Tab switches to documents panel
   - [ ] Display any existing documents (from localStorage or DB)
   - [ ] Add document form appears
   - [ ] Select document type (Passport, Visa, ID Card, Other)
   - [ ] Enter document number
   - [ ] Set expiry date
   - [ ] Add optional notes
   - [ ] Submit document
   - [ ] Document appears in list

4. **Document Management**
   - [ ] Documents display with key info
   - [ ] Show expiry status (green if >6 months, red if <6 months)
   - [ ] Delete button removes document
   - [ ] Deleted document disappears from list
   - [ ] Documents persist after page reload (localStorage or DB)

5. **Expiry Alerts**
   - [ ] Documents expiring within 6 months show warning
   - [ ] Click "Alerts" shows expiring documents
   - [ ] Alert list is separate view

---

### 5. CHATBOT FEATURE

**Setup:** Component appears globally on all pages

**Test Cases:**

1. **Open Chatbot**
   - [ ] Chatbot icon visible in bottom-right (or wherever positioned)
   - [ ] Click to open chat window
   - [ ] Initial greeting message appears
   - [ ] Input field appears at bottom

2. **Send Message**
   - [ ] Type message: "Show me spots in Paris"
   - [ ] Press Enter or click Send
   - [ ] Loading indicator shows
   - [ ] Response appears in chat
   - [ ] Message history displays

3. **Navigation Keywords**
   - [ ] Type "Go to packages"
   - [ ] Should redirect to packages page
   - [ ] Type "Show spots"
   - [ ] Should redirect to spots page
   - [ ] Type "Emergency"
   - [ ] Should redirect to emergency page

4. **Content Queries**
   - [ ] Type "What spots do you have?"
   - [ ] Response includes spot data
   - [ ] Type "What packages are available?"
   - [ ] Response includes package suggestions

5. **Fallback**
   - [ ] Type random message
   - [ ] Fallback help message appears
   - [ ] Help message includes navigation hints

---

## System-Wide Tests

### Authentication & Authorization
- [ ] Without token, can access login/signup/public pages
- [ ] Without token, cannot access protected routes
- [ ] With token, can access all features
- [ ] Token stored in localStorage persists
- [ ] Logout clears token

### API Communication
- [ ] Backend running on localhost:8080
- [ ] Frontend running on localhost:5173
- [ ] Proxy routes /api to backend
- [ ] All fetch/axios calls complete without CORS errors
- [ ] Error responses handled gracefully

### Data Persistence
- [ ] Created data survives page refresh
- [ ] Deleted data doesn't reappear
- [ ] Updates reflect immediately
- [ ] No duplicate data creation

### Loading States
- [ ] Loading indicators appear during API calls
- [ ] Spinner/skeleton disappears when data loads
- [ ] Disabled buttons during submission
- [ ] Clear error messages on failures

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Server errors (5xx) display error message
- [ ] Validation errors show field-level feedback
- [ ] No console errors on normal operation

---

## Performance Checklist

- [ ] Package list loads in <2 seconds
- [ ] Spot search returns results quickly
- [ ] Chat responses appear within 3 seconds
- [ ] Page transitions are smooth
- [ ] Images load without blocking UI
- [ ] No memory leaks in browser console

---

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Mobile Responsiveness

- [ ] All pages responsive on mobile (375px width)
- [ ] Buttons/inputs accessible on touch devices
- [ ] Navigation works on mobile
- [ ] Chat works on mobile
- [ ] Images scale properly

---

## Deployment Readiness

- [ ] No hardcoded localhost URLs (use env vars)
- [ ] No console.log spam
- [ ] No console errors in dev tools
- [ ] No auth tokens exposed in URLs
- [ ] Production .env properly configured
- [ ] Database connection string set
- [ ] API_BASE points to production server

---

## Common Issues Found During Testing

| Issue | Feature | Fix |
|-------|---------|-----|
| 404 on API call | Any | Check API_BASE env var |
| CORS error | Any | Verify vite proxy in vite.config.js |
| Empty results | Packages, Spots | Run seed endpoints manually |
| Auth fails | Docs, Blogs | Ensure Bearer token in header |
| Chat not responding | Chatbot | Check MongoDB connection |
| Pagination broken | Packages, Blogs | Verify pagination params |
| Images not loading | Spots, Packages | Check image URLs and file permissions |

---

## Final Verification Summary

**All Merge Conflicts:** ✅ RESOLVED
**All Endpoints:** ✅ VERIFIED  
**All Models:** ✅ EXPORTED
**All Controllers:** ✅ IMPORTED
**All Routes:** ✅ MOUNTED
**Frontend-Backend Wiring:** ✅ COMPLETE
**Feature Integration:** ✅ COMPLETE

**Ready for Testing!**


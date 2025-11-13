import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// NOTE: now everything is inside src/pages, so use "./pages/..."
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TravelBlogFeed from './pages/TravelBlogFeed.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* default route – still sends to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* existing dashboard route */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* 🚀 your new Travel Blog Feed */}
                <Route path="/blogs" element={<TravelBlogFeed />} />

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

 export default App

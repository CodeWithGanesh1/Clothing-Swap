import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import ItemDetail from "./pages/ItemDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SwapRequests from "./pages/SwapRequests";
import Chat from "./pages/Chat";
import AdminPanel from "./pages/AdminPanel";
import NearbySwaps from "./pages/NearbySwaps";

function Home() {
  const { user } = useAuth();
  return user ? <Listings /> : <Landing />;
}

function App() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route
          path="/nearby"
          element={<ProtectedRoute><NearbySwaps /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/swaps"
          element={<ProtectedRoute><SwapRequests /></ProtectedRoute>}
        />
        <Route
          path="/chat/:swapId"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>}
        />
        </Routes>
      </div>
    </>
  );
}

export default App;

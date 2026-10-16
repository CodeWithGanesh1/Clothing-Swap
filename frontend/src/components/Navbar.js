import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      className={
        isActive(path)
          ? "text-primary border-b-2 border-primary pb-1 text-body-md font-medium hover:text-primary transition-colors cursor-pointer"
          : "text-on-surface-variant text-body-md font-medium hover:text-primary transition-colors cursor-pointer pb-1"
      }
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-12 h-16 w-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-6 md:gap-8">
          <span className="text-xl font-bold text-primary tracking-tight">ReWear</span>
          <div className="hidden md:flex items-center gap-6">
            {navLink("/browse", "Browse")}
            {user && navLink("/nearby", "Nearby")}
            {user && navLink("/dashboard", "Dashboard")}
            {user && navLink("/swaps", "Swaps")}
            {user?.role === "admin" && navLink("/admin", "Admin")}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm">
                <span className="material-symbols-outlined">person</span>
                {user.name}
              </Link>
              <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-secondary-container text-primary font-semibold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors cursor-pointer bg-transparent border-none"
                title="Logout"
              >
                logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors">Login</Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

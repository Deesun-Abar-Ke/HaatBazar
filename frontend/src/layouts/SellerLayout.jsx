import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Package,
  History,
  UserCircle,
  MessageSquare,
  LogOut,
  PlusCircle,
  BarChart,
  Wallet
} from "lucide-react";

const API_URL = 'http://localhost:5001/api';
const BASE_URL = 'http://localhost:5001';

const SellerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // Add effect to listen for user updates in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Set up interval to check localStorage
    const interval = setInterval(() => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
          setUser(parsedUser);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const menuItems = [
    { path: "/seller", icon: Home, label: "Home" },
    { path: "/seller/overview", icon: LayoutDashboard, label: "Overview" },
    { path: "/seller/profile", icon: UserCircle, label: "Profile" },
    { path: "/seller/products", icon: Package, label: "Products" },
    { path: "/seller/add-product", icon: PlusCircle, label: "Upload Product" },
    // { path: "/seller/sales", icon: BarChart, label: "Sales History" },
    { path: "/seller/transactions", icon: Wallet, label: "Transactions" },
    { path: "/seller/complaints", icon: MessageSquare, label: "Complaints" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-600">Seller Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-green-50 text-green-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                {user?.image ? (
                  <img
                    src={user.image.startsWith('http') ? user.image : `${BASE_URL}${user.image}`}
                    alt={user.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green-600 font-semibold">
                    {user?.business_name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.business_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout; 
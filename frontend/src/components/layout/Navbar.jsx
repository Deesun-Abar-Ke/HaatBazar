import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/');
    setUser(null);
  };

  const publicNavLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const buyerNavLinks = [
    { name: "Home", path: "/buyer/home" },
    { name: "Profile", path: "/buyer/profile" },
    { name: "Cart", path: "/buyer/cart" },
    { name: "History", path: "/buyer/history" },
    { name: "Complaints", path: "/buyer/complaints" },
    { name: "Reviews", path: "/buyer/reviews" },
  ];

  const navLinks = user ? buyerNavLinks : publicNavLinks;

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-green-800 flex items-center">
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              HaatBazar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-green-600 relative group ${
                  isActive(link.path)
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full ${
                  isActive(link.path) ? "w-full" : ""
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <CartButton />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className="bg-green-100 text-green-800">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/buyer/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/signup" className="hidden lg:block">
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                    Become a Seller
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-green-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-green-600" />
            ) : (
              <Menu className="h-6 w-6 text-green-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-green-100">
            <div className="py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                >
                  Logout
                </button>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Link to="/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md">
                      Sign Up
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50">
                      Become a Seller
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 
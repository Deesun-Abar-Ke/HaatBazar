import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import { useState, useEffect } from "react";

const MainLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-50">
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
                <div className="px-4 py-2 space-y-2">
                  <CartButton />
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
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-16">{children}</main>

      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                HaatBazar
              </h3>
              <p className="text-gray-400">
                Your trusted marketplace for agricultural products.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">
                    Shipping Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>support@haatbazar.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>+880 1234-567890</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} HaatBazar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 
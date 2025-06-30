import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
              HaatBazar
            </h3>
            <p className="text-gray-600">
              Your premier destination for agricultural products. Connect directly with farmers,
              sellers, and buyers in one unified marketplace.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-gray-600">
                  123 Agriculture Street,<br />
                  Farmington, FL 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-600" />
                <a
                  href="mailto:info@haatbazar.com"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  info@haatbazar.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} HaatBazar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
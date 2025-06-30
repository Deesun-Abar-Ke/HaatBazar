import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Star, Wallet } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { getProducts, getStats } from "@/services/api";
import banner from '@/assets/landing_banner.jpg';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBuyers: 0,
    totalSellers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, statsRes] = await Promise.all([
          getProducts(),
          getStats()
        ]);
        setProducts(productsRes.data);
        const statsData = statsRes.data || {};
        setStats({
          totalProducts: statsData.totalProducts || 0,
          totalBuyers: statsData.totalBuyers || 0,
          totalSellers: statsData.totalSellers || 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative min-h-[600px] flex items-center overflow-hidden pb-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={banner}
            alt="Fresh agricultural products"
            className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Fresh from Farm to Your Table
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl animate-fade-in-up animation-delay-200">
              Your premier destination for agricultural products. Connect directly with farmers,
              sellers, and buyers in one unified marketplace.
            </p>
            <div className="flex gap-4 animate-fade-in-up animation-delay-400">
              <Link to="/products">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                  Explore Products <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/* <Link to="/signup">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                  Become a Seller
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Moved outside and below hero section */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-2">
              {loading ? (
                <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
              ) : (
                stats.totalProducts.toLocaleString()
              )}
            </h3>
            <p className="text-gray-600 font-medium">Products Available</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-2">
              {loading ? (
                <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
              ) : (
                stats.totalSellers.toLocaleString()
              )}
            </h3>
            <p className="text-gray-600 font-medium">Verified Sellers</p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-2">
              {loading ? (
                <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
              ) : (
                stats.totalBuyers.toLocaleString()
              )}
            </h3>
            <p className="text-gray-600 font-medium">Happy Buyers</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
            Why Choose HaatBazar?
          </span>
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          We provide a secure and reliable platform for agricultural trade, connecting farmers directly with buyers.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white via-white to-green-50/50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group backdrop-blur-sm">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 transform group-hover:rotate-6 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Verified Sellers
            </h3>
            <p className="text-gray-600">
              All sellers are thoroughly verified to ensure quality and reliability.
              Buy with confidence from trusted agricultural producers.
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-white to-green-50/50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group backdrop-blur-sm">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 transform group-hover:rotate-6 transition-transform duration-300">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Secure Transaction
            </h3>
            <p className="text-gray-600">
              Your payments are protected with our secure payment system.
              Safe and hassle-free transactions for both buyers and sellers.
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-white to-green-50/50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group backdrop-blur-sm">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 transform group-hover:rotate-6 transition-transform duration-300">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Quality Assured
            </h3>
            <p className="text-gray-600">
              Each product meets strict quality standards. We guarantee the
              freshness and quality of all items.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-gradient-to-b from-green-50/50 via-white to-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
                Featured Products
              </span>
            </h2>
            <Link to="/products">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 group">
                View All Products 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <div className="group transition-all duration-300 hover:shadow-xl rounded-xl overflow-hidden">
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    className="group-hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Package } from 'lucide-react';

// Base64 placeholder image (light gray with product icon)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik0xODUgMTIwaDMwdjMwaC0zMHoiIGZpbGw9IiM5Y2EzYWYiLz48cGF0aCBkPSJNMTcwIDEwNWg2MHY2MGgtNjB6IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PC9zdmc+';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of fresh agricultural products from trusted farmers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product }) => {
  const getImageUrl = (image) => {
    if (!image || typeof image !== 'string') {
      return PLACEHOLDER_IMAGE;
    }
    
    try {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      return `http://localhost:5000${image}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return PLACEHOLDER_IMAGE;
    }
  };

  const formatPrice = (price) => {
    try {
      return typeof price === 'number' 
        ? price.toLocaleString('en-IN')
        : parseFloat(price).toLocaleString('en-IN');
    } catch (error) {
      return '0';
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={getImageUrl(product.image)}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            In Stock
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className="px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
          <span>•</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">{product.subcategory}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {product.name || 'Unnamed Product'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin size={16} />
          <span>{product.division}</span>
          <span>•</span>
          <Package size={16} />
          <span>{product.stock} {product.unit}s available</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              ₹{formatPrice(product.price_per_unit)}
            </span>
            <span className="text-sm text-gray-500">per {product.unit}</span>
          </div>
          
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedProducts; 
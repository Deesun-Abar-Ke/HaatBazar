import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, MapPin, Package2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const API_URL = 'http://localhost:5001/api';
const BASE_URL = 'http://localhost:5001';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success("Added to cart successfully!");
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/products/${product._id}`);
  };

  // Function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  return (
    <Link to={`/products/${product._id}`}>
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-[0_2px_12px_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.12)]">
        <div className="relative w-full pt-[100%]">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-green-700 shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          </div>
          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <Button
                size="icon"
                className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 rounded-full shadow-lg hover:shadow-xl w-10 h-10 transition-all duration-300"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 rounded-full shadow-lg hover:shadow-xl w-10 h-10 transition-all duration-300"
                onClick={handleViewDetails}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Product Title and Price */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors duration-300 mb-2">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                ৳{product.price_per_unit.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                per {product.unit}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{product.division}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package2 className="h-4 w-4" />
              <span className="text-sm">
                Stock: {product.stock} {product.unit}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300"
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard; 
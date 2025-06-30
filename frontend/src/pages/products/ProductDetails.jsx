import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProduct } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Star } from "lucide-react";
import axios from "axios";

const API_URL = 'http://localhost:5001/api';
const BASE_URL = 'http://localhost:5001';

// Function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(id);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/${id}/reviews`);
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating || 0);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success("Added to cart successfully!");
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    // Navigate to cart page
    window.location.href = "/cart";
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
        <Link to="/products" className="text-green-600 hover:text-green-700">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="inline-block ml-2 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {product.subcategory}
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold text-green-600">
            ৳{product.price_per_unit}/{product.unit}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-gray-900">{product.division}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Available Stock</h3>
              <p className="mt-1 text-gray-900">
                {product.stock} {product.unit}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity ({product.unit})
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock}
                  className="max-w-[150px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                Total: ৳{(quantity * product.price_per_unit).toFixed(2)}
              </div>
              <div className="space-x-2">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="border-green-600 text-green-600"
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </Button>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>This product is sold by a verified seller.</p>
              <p>Contact seller for bulk orders or inquiries.</p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(averageRating)} />
                  <span className="text-lg font-medium text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white rounded-lg shadow-sm p-6 border"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {review.buyer_id?.name || "Anonymous"}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      )}

                      {review.image && (
                        <div className="mt-4">
                          <img
                            src={review.image}
                            alt="Review"
                            className="max-w-xs rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 
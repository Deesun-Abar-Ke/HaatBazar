import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/services/api";
import { Star, ArrowLeft, Edit, Trash } from "lucide-react";
import axios from "axios";

const API_URL = 'http://localhost:5001/api';

const SellerProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleEdit = () => {
    // Navigate to edit product page
    navigate(`/seller/products/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        navigate('/seller/products');
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
        <Button 
          onClick={() => navigate('/seller/products')} 
          variant="link" 
          className="text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => navigate('/seller/products')} 
          variant="ghost" 
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to products
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex gap-2">
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
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

          {/* Product Stats */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-xl font-semibold text-gray-900">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-900">৳0</p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
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
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
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
  );
};

export default SellerProductDetails; 
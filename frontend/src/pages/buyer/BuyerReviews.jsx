import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Pencil, Trash2, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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

const StarRating = ({ rating, setRating, disabled = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && setRating(star)}
          className={`${
            disabled ? "cursor-default" : "cursor-pointer hover:text-yellow-500"
          } ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  );
};

const BuyerReviews = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId');
  const orderId = queryParams.get('orderId');

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      setProductDetails(response.data);
    } catch (error) {
      toast.error("Failed to fetch product details");
    }
  };

  const fetchReviews = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/buyers/${user._id}/reviews`);
      setReviews(response.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(review => ({
          ...review,
          product: review.product_id
        }))
      );
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const reviewData = new FormData();
      reviewData.append("buyer_id", user._id);
      reviewData.append("product_id", productId);
      reviewData.append("order_id", orderId);
      reviewData.append("rating", formData.rating);
      reviewData.append("comment", formData.comment);
      
      if (formData.image instanceof File) {
        reviewData.append("image", formData.image);
      }

      await axios.post(`${API_URL}/reviews`, reviewData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Review submitted successfully");
      navigate("/buyer/history");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setFormData({
      rating: review.rating,
      comment: review.comment,
      image: review.image,
    });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show review form if productId is present
  if (productId && productDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/buyer/history")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order History
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Write a Review
          </h1>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={getImageUrl(productDetails.image)}
              alt={productDetails.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {productDetails.name}
              </h2>
              <p className="text-sm text-gray-600">
                {productDetails.category}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={formData.rating}
                setRating={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="review-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("review-image").click()}
                >
                  Upload Image
                </Button>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/buyer/history")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Reviews Yet
        </h2>
        <p className="text-gray-600">
          You haven't written any reviews yet. Start shopping and share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 mb-8">
        My Reviews
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-green-100"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={getImageUrl(review.product.image)}
                  alt={review.product.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {review.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <StarRating rating={review.rating} disabled />
                </div>
              </div>
              
              <p className="mt-4 text-gray-700">{review.comment}</p>
              
              {review.image && (
                <img
                  src={getImageUrl(review.image)}
                  alt="Review"
                  className="mt-4 rounded-lg max-h-48 object-cover"
                />
              )}
              
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(review)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(review._id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerReviews; 
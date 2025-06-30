import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, XCircle, Star, FileDown } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const API_URL = 'http://localhost:5001/api';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    PROCESSING: { color: "bg-blue-100 text-blue-800", icon: Package },
    COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status}
    </span>
  );
};

const ReviewDialog = ({ product, orderId, onReviewSubmitted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    checkExistingReview();
  }, []);

  const checkExistingReview = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/reviews/check`, {
        params: {
          buyer_id: user._id,
          product_id: product._id
        }
      });
      setHasReviewed(response.data.hasReviewed);
    } catch (error) {
      console.error("Error checking review:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      formData.append("buyer_id", user._id);
      formData.append("product_id", product._id);
      formData.append("order_id", orderId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (image) {
        formData.append("image", image);
      }

      await axios.post(`${API_URL}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Review submitted successfully");
      setIsOpen(false);
      onReviewSubmitted();
      setHasReviewed(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={hasReviewed}
          variant="outline"
          className="ml-4"
        >
          {hasReviewed ? "Already Reviewed" : "Write Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer ${
                  star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div>
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
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-20 w-20 object-cover rounded"
              />
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BuyerHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/buyers/${user._id}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, { status: "CANCELLED" });
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94); // green-600
    doc.text("Order History", 14, 20);
    
    // Add buyer info
    doc.setFontSize(12);
    doc.setTextColor(0);
    const user = JSON.parse(localStorage.getItem('user'));
    doc.text(`Buyer: ${user.name}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
    
    // Prepare table data
    const tableData = orders.map(order => [
      new Date(order.createdAt).toLocaleDateString(),
      order.ordered_products.map(p => `${p.product_id.name} (${p.quantity})`).join('\n'),
      order.status,
      `৳${order.total_price.toFixed(2)}`
    ]);
    
    // Add table
    doc.autoTable({
      startY: 45,
      head: [['Date', 'Products', 'Status', 'Total']],
      body: tableData,
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
      theme: 'grid'
    });
    
    // Save PDF
    doc.save('order-history.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">
          You haven't placed any orders yet. Start shopping to see your order history.
        </p>
        <Button
          onClick={() => navigate("/buyer/home")}
          className="bg-green-600 hover:bg-green-700"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
          Order History
        </h1>
        <Button
          onClick={generatePDF}
          variant="outline"
          className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 shadow-sm"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order._id} 
            className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg overflow-hidden border border-green-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-green-50 to-white p-6 border-b border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order ID: {order._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <div className="p-6">
              <div className="divide-y divide-green-100">
                {order.ordered_products.map((item) => (
                  <div
                    key={item._id}
                    className="py-6 hover:bg-green-50/50 transition-colors cursor-pointer rounded-lg px-4"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.product_id.image}
                        alt={item.product_id.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product_id.name}
                        </h3>
                        <p className="text-gray-600">
                          Quantity: {item.quantity} {item.product_id.unit}
                        </p>
                        <p className="text-green-600">
                          ৳{item.product_id.price_per_unit}/{item.product_id.unit}
                        </p>
                      </div>
                      <div className="text-right flex items-center">
                        <p className="text-lg font-medium text-gray-900">
                          ৳{item.subtotal.toFixed(2)}
                        </p>
                        {order.status === "DELIVERED" && (
                          <Button
                            variant="outline"
                            className="ml-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/buyer/reviews?productId=${item.product_id._id}&orderId=${order._id}`);
                            }}
                          >
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-green-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Shipping Address:</p>
                    <p className="text-gray-900">{order.shipping_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ৳{order.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.status === "PENDING" && (
                  <Button
                    variant="outline"
                    className="mt-4 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerHistory; 
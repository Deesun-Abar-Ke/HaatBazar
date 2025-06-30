import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { CreditCard, Calendar, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const API_URL = 'http://localhost:5001/api';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, totalAmount } = location.state || {};
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  if (!orders || !orders.length) {
    navigate("/cart");
    return null;
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces after every 4 digits
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
      if (value.length > 19) return; // Limit to 16 digits + 3 spaces
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      value = value.replace(/\//g, '');
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      if (value.length > 5) return; // Limit to MM/YY format
    }
    
    // Limit CVV to 3 digits
    if (name === 'cvv' && value.length > 3) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv } = formData;
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return false;
    }

    if (cvv.length !== 3) {
      toast.error("Please enter a valid 3-digit CVV");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Place orders and get their IDs
      const orderPromises = orders.map(orderData => 
        axios.post(`${API_URL}/orders`, orderData)
      );
      
      const orderResponses = await Promise.all(orderPromises);
      
      // Create transactions for each order
      const transactionPromises = orderResponses.map(response => {
        const transactionData = {
          order_id: response.data._id,
          amount: response.data.total_price,
          payment_type: "CARD",
          status: "SUCCESS"
        };
        return axios.post(`${API_URL}/transactions`, transactionData);
      });

      await Promise.all(transactionPromises);

      clearCart();
      toast.success("Payment successful! Orders have been placed.");
      navigate("/buyer/history");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Total</p>
              <p className="text-2xl font-bold text-green-600">
                ৳{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative mt-1">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className="pl-10"
                  required
                  pattern="\d{4}\s\d{4}\s\d{4}\s\d{4}"
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <div className="relative mt-1">
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <div className="relative mt-1">
                  <Input
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    className="pl-10"
                    required
                    type="password"
                    maxLength={3}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Test Card Details:</strong><br />
                Card Number: Any 16 digits<br />
                Expiry: Any future date (MM/YY)<br />
                CVV: Any 3 digits
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway; 
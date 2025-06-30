import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.shipping_address) {
      setShippingAddress(user.shipping_address);
    }
  }, []);

  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value);
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to complete your purchase", {
        description: "You'll be redirected to the login page.",
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error("Please login to complete your purchase");
      navigate("/login");
      return;
    }

    // Group products by seller
    const ordersBySeller = cart.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = {
          seller_id: item.sellerId,
          ordered_products: [],
          total_price: 0,
        };
      }
      acc[item.sellerId].ordered_products.push({
        product_id: item.productId,
        quantity: item.quantity,
        subtotal: item.total,
      });
      acc[item.sellerId].total_price += item.total;
      return acc;
    }, {});

    // Create order data for each seller
    const orders = Object.values(ordersBySeller).map(order => ({
      buyer_id: user._id,
      seller_id: order.seller_id,
      ordered_products: order.ordered_products,
      total_price: order.total_price,
      shipping_address: shippingAddress,
      billing_address: user.billing_address || shippingAddress,
      status: "ORDER_PLACED"
    }));

    // Navigate to payment gateway with orders data
    navigate("/payment", { state: { orders, totalAmount: getCartTotal() } });
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <ShoppingBag className="h-24 w-24 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Browse our products and add some items to your cart.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.productId} className="p-6">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-lg font-medium text-gray-900 hover:text-green-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-green-600">
                        ৳{item.price}/{item.unit}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, e.target.value)
                        }
                        className="w-20"
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-gray-900">
                        ৳{item.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="text-gray-900">৳{getCartTotal().toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Shipping</p>
              <p className="text-gray-900">Free</p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <p className="text-lg font-medium text-gray-900">Total</p>
                <p className="text-lg font-medium text-gray-900">
                  ৳{getCartTotal().toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <Input
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your shipping address"
                className="mb-4"
              />
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>

            <Link to="/products">
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 
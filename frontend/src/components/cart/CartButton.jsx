import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartButton = () => {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <Link to="/buyer/cart">
      <Button
        variant="outline"
        className="relative border-green-600 text-green-600"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartButton; 
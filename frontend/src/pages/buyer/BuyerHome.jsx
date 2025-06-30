import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/products/ProductCard";
import axios from "axios";
import { Filter, Package } from "lucide-react";

const API_URL = 'http://localhost:5001/api';

const BuyerHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    division: "all",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (
      filters.search &&
      !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !product.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    if (filters.division !== "all" && product.division !== filters.division) {
      return false;
    }
    if (filters.minPrice && product.price_per_unit < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && product.price_per_unit > parseFloat(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const categories = ["all", "Vegetable", "Fruit", "Grannary", "Fish", "Pesticide", "Fertilizer"];  
  
  const divisions = [
    "all",
    "Dhaka",
    "Chittagong",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters Section */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md mb-8 border border-green-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-green-600" />
            Filter Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full focus:ring-green-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="w-full focus:ring-green-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Division */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Division
              </label>
              <Select
                value={filters.division}
                onValueChange={(value) => handleFilterChange("division", value)}
              >
                <SelectTrigger className="w-full focus:ring-green-500">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division.charAt(0).toUpperCase() + division.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full focus:ring-green-500"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
              Available Products
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group">
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-green-50 hover:border-green-100">
                  <ProductCard 
                    product={product} 
                    className="group-hover:opacity-95 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-green-100">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BuyerHome; 
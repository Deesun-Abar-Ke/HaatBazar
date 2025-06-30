import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = 'http://localhost:5001/api';
const BASE_URL = 'http://localhost:5001';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price_per_unit: "",
    unit: "kg",
    stock: "",
    division: "",
    image: null,
  });

  const categories = ["Vegetable", "Fruit", "Grannary", "Fish", "Pesticide", "Fertilizer"];
  const divisions = [
    "Dhaka",
    "Chittagong",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];
  const units = ["kg", "piece", "dozen", "liter", "gram"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' && !prev.subcategory && { subcategory: value }),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Please select a product image");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.category || !formData.price_per_unit || 
        !formData.unit || !formData.stock || !formData.division || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const productData = new FormData();
      
      // Append all non-file fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== null) {
          productData.append(key, formData[key]);
        }
      });
      
      // Append seller_id
      productData.append("seller_id", user._id);
      
      // Append image file
      if (formData.image instanceof File) {
        productData.append("image", formData.image);
      }

      // Make sure subcategory is set
      if (!formData.subcategory) {
        productData.append("subcategory", formData.category);
      }

      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully!");
      navigate("/seller/products");
    } catch (error) {
      console.error('Product creation error:', error);
      toast.error(error.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg overflow-hidden border border-green-100">
        <div className="p-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 mb-8">
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Image */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-50 border-2 border-dashed border-green-200">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-green-300" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="product-image"
                  className="absolute bottom-2 right-2 bg-green-600 text-white p-3 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload a product image (max 5MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="price_per_unit">Price per Unit</Label>
                <Input
                  id="price_per_unit"
                  name="price_per_unit"
                  type="number"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="stock">Stock Available</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="division">Division</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) => handleSelectChange("division", value)}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division} value={division}>
                        {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 md:col-span-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigate("/seller/products")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct; 
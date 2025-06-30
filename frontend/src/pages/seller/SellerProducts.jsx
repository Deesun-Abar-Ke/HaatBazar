import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Pencil, Trash2, Plus, Search, Camera } from "lucide-react";
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

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Vegetable", "Fruit", "Grannary", "Fish", "Pesticide", "Fertilizer"];
  const units = ["kg", "piece", "dozen", "liter", "gram"];
  const divisions = [
    "all",
    "Dhaka",
    "Chittagong",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/products/seller/${user._id}`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      image: null,
      currentImage: product.image,
      subcategory: product.subcategory || product.category,
      price_per_unit: Number(product.price_per_unit),
      stock: Number(product.stock)
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Handle all non-file fields
      const fieldsToUpdate = {
        name: editingProduct.name,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory || editingProduct.category,
        division: editingProduct.division,
        unit: editingProduct.unit,
        price_per_unit: Number(editingProduct.price_per_unit),
        stock: Number(editingProduct.stock),
        description: editingProduct.description
      };

      // Append all fields to formData
      Object.keys(fieldsToUpdate).forEach(key => {
        formData.append(key, fieldsToUpdate[key]);
      });

      // Handle image separately
      if (editingProduct.image instanceof File) {
        formData.append('image', editingProduct.image);
      }

      const response = await axios.put(
        `${API_URL}/products/${editingProduct._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the products list with the new data
      const updatedProduct = {
        ...response.data,
        image: response.data.image.startsWith('http') 
          ? response.data.image 
          : `${BASE_URL}${response.data.image}`
      };

      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === editingProduct._id ? updatedProduct : product
        )
      );

      toast.success("Product updated successfully");
      
      // Close the dialog by setting editingProduct to null
      setEditingProduct(null);

    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({
          ...prev,
          image: file,
          currentImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <Button
          onClick={() => navigate('/seller/add-product')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
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
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Division</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>৳{product.price_per_unit}/{product.unit}</TableCell>
                <TableCell>{product.stock} {product.unit}</TableCell>
                <TableCell>{product.division}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="flex justify-center mb-4">
                            <div className="relative">
                              <img
                                src={editingProduct?.currentImage ? getImageUrl(editingProduct.currentImage) : ''}
                                alt={editingProduct?.name}
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <label
                                htmlFor="product-image"
                                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50"
                              >
                                <Camera className="w-4 h-4 text-gray-600" />
                                <input
                                  id="product-image"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Product Name</Label>
                              <Input
                                id="name"
                                value={editingProduct?.name || ""}
                                onChange={(e) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select
                                value={editingProduct?.category}
                                onValueChange={(value) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    category: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.slice(1).map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="price">Price per Unit</Label>
                              <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingProduct?.price_per_unit || ""}
                                onChange={(e) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    price_per_unit: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="unit">Unit</Label>
                              <Select
                                value={editingProduct?.unit}
                                onValueChange={(value) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    unit: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
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

                            <div>
                              <Label htmlFor="stock">Stock Available</Label>
                              <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={editingProduct?.stock || ""}
                                onChange={(e) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    stock: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="division">Division</Label>
                              <Select
                                value={editingProduct?.division}
                                onValueChange={(value) =>
                                  setEditingProduct((prev) => ({
                                    ...prev,
                                    division: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select division" />
                                </SelectTrigger>
                                <SelectContent>
                                  {divisions.slice(1).map((division) => (
                                    <SelectItem key={division} value={division}>
                                      {division}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editingProduct?.description || ""}
                              onChange={(e) =>
                                setEditingProduct((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              required
                              rows={4}
                            />
                          </div>

                          <div className="flex justify-end gap-4 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingProduct(null)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts; 
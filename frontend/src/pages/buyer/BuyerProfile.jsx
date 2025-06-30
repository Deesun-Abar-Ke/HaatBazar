import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { Camera } from "lucide-react";

const API_URL = 'http://localhost:5001/api';

const BuyerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    billing_address: "",
    shipping_address: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        phone: parsedUser.phone || "",
        billing_address: parsedUser.billing_address || "",
        shipping_address: parsedUser.shipping_address || "",
        image: null,
      });
      if (parsedUser.image) {
        setImagePreview(parsedUser.image);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("billing_address", formData.billing_address);
      formDataToSend.append("shipping_address", formData.shipping_address);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.put(
        `${API_URL}/buyers/${user._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local storage with new user data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Update image preview and clear formData.image
      if (response.data.image) {
        setImagePreview(response.data.image);
        setFormData(prev => ({ ...prev, image: null }));
      }
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg overflow-hidden border border-green-100">
        <div className="p-8">
          {/* Profile header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-green-100">
            <h2 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
              Profile Information
            </h2>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image - centered with larger size */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50 ring-4 ring-green-100 ring-offset-2">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-100">
                      <span className="text-4xl font-bold text-green-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-2 right-2 bg-green-600 text-white p-3 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form fields in a grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 focus:ring-green-500"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 bg-gray-50 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 focus:ring-green-500"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="billing_address" className="text-gray-700">Billing Address</Label>
                <Textarea
                  id="billing_address"
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="shipping_address" className="text-gray-700">Shipping Address</Label>
                <Textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>

            {isEditing && (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            )}
          </form>
        </div>

        {/* Account Information section with updated styling */}
        <div className="bg-gradient-to-br from-green-50 to-white px-8 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type</span>
              <span className="text-gray-900 font-medium capitalize">{user.userType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since</span>
              <span className="text-gray-900 font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile; 
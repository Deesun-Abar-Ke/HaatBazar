import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = 'http://localhost:5001/api';
const BASE_URL = 'http://localhost:5001';

const SellerProfile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    business_name: user?.business_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    trade_license: null,
    tin_certificate: null,
    image: null,
    description: user?.description || "",
  });

  // Add effect to update form data and image when user changes
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        business_name: parsedUser.business_name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
        description: parsedUser.description || "",
      }));

      // Set image preview
      if (parsedUser.image) {
        // If it's a full URL, use it as is, otherwise prepend the BASE_URL
        const imageUrl = parsedUser.image.startsWith('http') 
          ? parsedUser.image 
          : `${BASE_URL}${parsedUser.image}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      if (fieldName === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Handle all non-file fields first
      for (const key in formData) {
        if (formData[key] !== null && !['image', 'trade_license', 'tin_certificate'].includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Handle image file directly
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Handle other file fields if needed
      if (formData.trade_license) {
        formDataToSend.append('trade_license', formData.trade_license);
      }
      if (formData.tin_certificate) {
        formDataToSend.append('tin_certificate', formData.tin_certificate);
      }

      const response = await axios.put(
        `${API_URL}/sellers/${user._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = { ...user, ...response.data };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update local state
      setUser(updatedUser);
      
      // Update image preview if there's a new image URL
      if (response.data.image) {
        const imageUrl = response.data.image.startsWith('http') 
          ? response.data.image 
          : `${BASE_URL}${response.data.image}`;
        setImagePreview(imageUrl);
        setFormData(prev => ({ 
          ...prev, 
          image: null,
          business_name: response.data.business_name || prev.business_name,
          phone: response.data.phone || prev.phone,
          address: response.data.address || prev.address,
          description: response.data.description || prev.description,
        }));
      }

      // Trigger a storage event for other components
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg overflow-hidden border border-green-100">
        <div className="p-8">
          {/* Profile header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-green-100">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
              Business Profile
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
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-50 ring-4 ring-green-100 ring-offset-2">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-100">
                      <span className="text-4xl font-bold text-green-600">
                        {formData.business_name?.[0]?.toUpperCase()}
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
                      onChange={(e) => handleFileChange(e, 'image')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {isEditing && (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <Label htmlFor="trade_license">Trade License</Label>
                    <Input
                      id="trade_license"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'trade_license')}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <Label htmlFor="tin_certificate">TIN Certificate</Label>
                    <Input
                      id="tin_certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'tin_certificate')}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
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

        {/* Business Information */}
        <div className="bg-gradient-to-br from-green-50 to-white px-8 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Business Information
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

export default SellerProfile; 
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
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

const ComplaintStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: MessageSquare },
    RESOLVED: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle },
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

const BuyerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    image: null,
    complaint_id: "", // Changed from accuser_id to complaint_id
  });
  const [sellers, setSellers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchComplaints();
    fetchSellers();
  }, []);

  const fetchComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error("Please login to view complaints");
        return;
      }
      const response = await axios.get(`${API_URL}/complaints/buyer/${user._id}`);
      if (Array.isArray(response.data)) {
        setComplaints(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setComplaints([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Fetch complaints error:", error);
      toast.error("Failed to fetch complaints");
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get(`${API_URL}/sellers`);
      setSellers(response.data);
    } catch (error) {
      toast.error("Failed to fetch sellers");
    }
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
    
    if (!formData.complaint_id || !formData.message.trim()) {
        toast.error('Please select a seller and enter your complaint');
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('complaint_id', formData.complaint_id);
    formData.append('accuser_id', JSON.parse(localStorage.getItem('user'))._id);
    formData.append('message', formData.message.trim());
    
    if (formData.image instanceof File) {
        formData.append('image', formData.image);
    }

    try {
        const response = await axios.post(
            `${API_URL}/buyer-complaints`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data) {
            toast.success('Complaint submitted successfully');
            setFormData({
                message: "",
                image: null,
                complaint_id: "",
            });
            setImagePreview(null);
            fetchComplaints();
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 mb-8">
        Complaints Management
      </h1>

      {/* Complaint Form */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border border-green-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Submit a New Complaint
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Seller
            </label>
            <Select
              value={formData.complaint_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, complaint_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller._id} value={seller._id}>
                    {seller.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Describe your complaint"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidence (Optional)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload").click()}
              >
                Upload Image
              </Button>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                />
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </form>
      </div>

      {/* Complaints List */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
          Your Complaints History
        </h2>

        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-green-100">
            <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Complaints Found
            </h3>
            <p className="text-gray-600">
              You haven't submitted any complaints yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Complaint against {complaint.complaint_id?.business_name || "Unknown Seller"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted on:{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ComplaintStatusBadge status={complaint.status || "PENDING"} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Message:</p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {complaint.message}
                      </p>
                    </div>

                    {complaint.image && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Evidence:
                        </p>
                        <img
                          src={getImageUrl(complaint.image)}
                          alt="Evidence"
                          className="max-w-sm rounded-lg"
                        />
                      </div>
                    )}

                    {complaint.response && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Admin Response:
                        </p>
                        <p className="text-gray-900">{complaint.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerComplaints; 
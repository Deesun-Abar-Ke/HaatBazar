import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  MessageSquare,
  Search,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = 'http://localhost:5001/api';

const ComplaintStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: {
      className: "bg-yellow-100 text-yellow-800",
      icon: Clock
    },
    RESOLVED: {
      className: "bg-green-100 text-green-800",
      icon: CheckCircle2
    },
    REJECTED: {
      className: "bg-red-100 text-red-800",
      icon: XCircle
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${config.className}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  );
};

const SellerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [buyerSearchTerm, setBuyerSearchTerm] = useState("");
  const [complaintSearchTerm, setComplaintSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    image: null,
    accused_id: "",
  });

  useEffect(() => {
    fetchComplaints();
    fetchBuyers();
    setTimeout(() => setMounted(true), 100);
  }, []);

  const fetchComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/complaints/seller/${user._id}`);
      setComplaints(response.data);
    } catch (error) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/sellers/${user._id}/buyers`);   
      setBuyers(response.data);
    } catch (error) {
      toast.error("Failed to fetch buyers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.accused_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const complaintData = new FormData();
      complaintData.append("complainant_id", formData.accused_id);
      complaintData.append("accuser_id", user._id);
      complaintData.append("message", formData.message);
      
      // Only append image if it exists and is a File object
      if (formData.image instanceof File) {
        complaintData.append("image", formData.image);
      }

      const response = await axios.post(`${API_URL}/complaints/seller`, complaintData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Complaint submitted successfully");
      setFormData({
        message: "",
        image: null,
        accused_id: "",
      });
      setImagePreview(null);
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error.response?.data?.error || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(buyerSearchTerm.toLowerCase())
  );

  const filteredComplaints = complaints.filter(complaint =>
    complaint.message.toLowerCase().includes(complaintSearchTerm.toLowerCase()) ||
    (complaint.complainant_id?.name || '').toLowerCase().includes(complaintSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className={`transition-all duration-500 transform ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 mb-8">
          Complaints Management
        </h1>

        {/* Complaint Form */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Submit a New Complaint
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="accused_id">Select Buyer</Label>
              <div className="mt-1.5 relative">
                <Select
                  value={formData.accused_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, accused_id: value }))
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-3 py-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search buyers..."
                          value={buyerSearchTerm}
                          onChange={(e) => setBuyerSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <SelectGroup>
                      <SelectLabel>Buyers</SelectLabel>
                      {filteredBuyers.map((buyer) => (
                        <SelectItem key={buyer._id} value={buyer._id}>
                          <div className="flex flex-col">
                            <span>{buyer.name}</span>
                            <span className="text-xs text-gray-500">{buyer.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Complaint Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                required
                rows={4}
                placeholder="Describe your complaint..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="image">Evidence (Optional)</Label>
              <div className="mt-1.5">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative"
                    onClick={() => document.getElementById('image').click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Button>
                  {imagePreview && (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded transition-transform group-hover:scale-105"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 5MB. Supported formats: JPG, PNG
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </div>
      </div>

      {/* Complaints List */}
      <div className={`space-y-6 transition-all duration-500 transform ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Your Complaints History
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search complaints..."
              value={complaintSearchTerm}
              onChange={(e) => setComplaintSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-green-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
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
            {filteredComplaints.map((complaint, index) => (
              <div
                key={complaint._id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 overflow-hidden transform hover:-translate-y-1 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Complaint against {complaint.complainant_id?.name || 'Unknown Buyer'}
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
                      <p className="text-gray-900 whitespace-pre-wrap mt-1">
                        {complaint.message}
                      </p>
                    </div>

                    {complaint.image && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Evidence:
                        </p>
                        <img
                          src={complaint.image}
                          alt="Evidence"
                          className="max-w-sm rounded-lg transition-transform hover:scale-105"
                        />
                      </div>
                    )}

                    {complaint.response && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
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

export default SellerComplaints; 
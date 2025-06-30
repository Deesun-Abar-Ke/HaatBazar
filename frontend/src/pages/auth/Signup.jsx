import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthLayout from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const API_URL = 'http://localhost:5001/api';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      switch (userType) {
        case 'buyer':
          endpoint = '/auth/buyer/register';
          break;
        case 'seller':
          endpoint = '/auth/seller/register';
          break;
        default:
          throw new Error('Invalid user type');
      }

      // Remove confirmPassword from the data sent to the server
      const { confirmPassword, ...submitData } = formData;
      
      const response = await axios.post(`${API_URL}${endpoint}`, submitData);
      
      if (response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          ...response.data,
          userType
        }));
        
        toast.success("Account created successfully!");

        // Redirect based on user type
        if (userType === 'buyer') {
          navigate('/buyer/home');
        } else if (userType === 'seller') {
          navigate('/seller/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join HaatBazar today"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              I want to register as a
            </label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              className="mt-1"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="pr-10"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {userType === "seller" && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                Note: As a seller, you'll need to provide additional information and documentation
                (like TIN, business details) after registration. Your account will be reviewed by
                our admin team before activation.
              </p>
            </div>
          )}
        </div>

        <div>
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-500">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup; 
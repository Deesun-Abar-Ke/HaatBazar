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

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      switch (userType) {
        case 'buyer':
          endpoint = '/auth/buyer/login';
          break;
        case 'seller':
          endpoint = '/auth/seller/login';
          break;
        case 'admin':
          endpoint = '/auth/admin/login';
          break;
        default:
          throw new Error('Invalid user type');
      }

      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          ...response.data,
          userType
        }));
        
        toast.success("Login successful!");

        // Redirect based on user type
        switch (userType) {
          case 'buyer':
            navigate('/buyer/home');
            break;
          case 'seller':
            navigate('/seller');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to login");
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
      title="Sign in to your account"
      subtitle="Welcome back to HaatBazar"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              I am a
            </label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="text-green-600 hover:text-green-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:text-green-500">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login; 
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <Link to="/" className="flex justify-center">
            <h2 className="text-3xl font-bold text-green-800">HaatBazar</h2>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SellerOverview = () => {
  // ... your data fetching logic ...

  // Example data for Revenue by Division
  const revenueData = {
    labels: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 3000, 5000, 2000, 3000, 9000, 4000],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
    }]
  };

  // Example data for Product Distribution
  const productDistributionData = {
    labels: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'],
    datasets: [{
      label: 'Number of Products',
      data: [65, 59, 80, 81, 56, 55, 40, 35],
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
    }]
  };

  // Example data for Stock Level
  const stockLevelData = {
    labels: ['Vegetables', 'Fruits', 'Grains', 'Fish', 'Pesticides', 'Fertilizers'],
    datasets: [{
      data: [30, 25, 15, 10, 10, 10],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(234, 179, 8, 0.8)',
      ],
    }]
  };

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... your stats cards ... */}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Revenue by Division</h2>
          <div className="h-[400px] w-full">
            <Line 
              data={revenueData}
              options={{
                ...commonOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawBorder: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Product Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Product Distribution</h2>
          <div className="h-[400px] w-full">
            <Bar 
              data={productDistributionData}
              options={{
                ...commonOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawBorder: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Stock Level Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Stock Level Distribution</h2>
          <div className="h-[400px] w-full">
            <Pie 
              data={stockLevelData}
              options={{
                ...commonOptions,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 20,
                      padding: 15,
                      font: {
                        size: 12
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOverview; 
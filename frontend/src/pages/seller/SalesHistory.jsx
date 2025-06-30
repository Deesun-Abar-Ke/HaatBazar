import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, FileDown } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const API_URL = 'http://localhost:5001/api';

const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.PENDING}`}>
      {status}
    </span>
  );
};

const SalesHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/orders/seller/${user._id}`);
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales History Report', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Order ID", "Buyer", "Products", "Total", "Status", "Date"];
    const tableRows = filteredOrders.map(order => [
      order._id,
      order.buyer_id.name,
      order.ordered_products.map(p => `${p.product_id.name} (${p.quantity})`).join(', '),
      `৳${order.total_price.toFixed(2)}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      columnStyles: { 2: { cellWidth: 50 } }
    });

    doc.save('sales-history.pdf');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.buyer_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const orderDate = new Date(order.createdAt);
    const matchesDateFilter = 
      (!dateFilter.startDate || orderDate >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || orderDate <= new Date(dateFilter.endDate));

    return matchesSearch && matchesDateFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <Button
          onClick={generatePDF}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by order ID or buyer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-40">
            <Input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full"
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order._id}</TableCell>
                <TableCell>{order.buyer_id.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.ordered_products.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.product_id.name} ({item.quantity} {item.product_id.unit})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>৳{order.total_price.toFixed(2)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No sales records match your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory; 
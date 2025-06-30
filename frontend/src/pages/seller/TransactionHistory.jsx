import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Download,
  ChevronDown,
  User,
  Package,
  Receipt,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = 'http://localhost:5001/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // Add a small delay to trigger mount animation
    setTimeout(() => setMounted(true), 100);
  }, []);

  const fetchTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_URL}/transactions/seller/${user._id}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (transactionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const transactionDate = new Date(transaction.createdAt);
    const matchesDateFilter = 
      (!dateFilter.startDate || transactionDate >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || transactionDate <= new Date(dateFilter.endDate));

    return matchesSearch && matchesDateFilter;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header with logo and title
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Transaction History", 20, 25);
    
    // Add date range if filtered
    if (dateFilter.startDate || dateFilter.endDate) {
      doc.setFontSize(12);
      doc.text(
        `Period: ${dateFilter.startDate || 'All'} to ${dateFilter.endDate || 'All'}`,
        20,
        45
      );
    }

    // Prepare table data with expanded details
    const tableData = filteredTransactions.map(transaction => [
      transaction.transaction_id,
      transaction.buyer_name,
      transaction.buyer_phone || 'N/A',
      `৳${transaction.amount.toFixed(2)}`,
      transaction.payment_type,
      transaction.status,
      format(new Date(transaction.createdAt), 'dd/MM/yyyy')
    ]);

    // Add table
    doc.autoTable({
      startY: 60,
      head: [['Transaction ID', 'Buyer Name', 'Phone', 'Amount', 'Payment', 'Status', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Add summary
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const successfulTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
    
    const summaryY = doc.autoTable.previous.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Transactions: ${filteredTransactions.length}`, 20, summaryY);
    doc.text(`Total Amount: ৳${totalAmount.toFixed(2)}`, 20, summaryY + 10);
    doc.text(`Successful Transactions: ${successfulTransactions}`, 20, summaryY + 20);

    // Save the PDF
    doc.save('transaction-history.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <Button
          onClick={generatePDF}
          className="bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
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

      {/* Summary Cards */}
      <div className=" flex flex-wrap justify-between mx-30">
        {[
          {
            title: "Total Transactions",
            value: filteredTransactions.length,
            icon: Receipt,
            delay: 0
          },
          {
            title: "Total Amount",
            value: `৳${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`,
            icon: Package,
            delay: 100
          },
          // {
          //   title: "Successful Transactions",
          //   value: filteredTransactions.filter(t => t.status === 'completed').length,
          //   icon: User,
          //   delay: 200
          // }
        ].map((card, index) => (
          <div
            key={card.title}
            className={`bg-white p-6 rounded-lg shadow-sm border border-green-100 transition-all duration-500 transform ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${card.delay}ms` }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <card.icon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction, index) => (
              <>
                <TableRow 
                  key={transaction._id}
                  className={`group hover:bg-gray-50 transition-opacity duration-300 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(transaction._id)}
                      className={`transition-transform duration-200 ${
                        expandedRows.has(transaction._id) ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{transaction._id}</TableCell>
                  <TableCell>{transaction.buyer_name}</TableCell>
                  <TableCell>৳{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{transaction.payment_type}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
                {expandedRows.has(transaction._id) && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={7} className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Buyer Details</h4>
                          <p className="mt-1">
                            <span className="font-medium">Name:</span> {transaction.buyer_name}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span> {transaction.buyer_phone || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Order Details</h4>
                          <p className="mt-1">
                            <span className="font-medium">Order ID:</span> {transaction.order_id}
                          </p>
                          <p>
                            <span className="font-medium">Shipping Address:</span> {transaction.shipping_address || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Products</h4>
                          {transaction.products?.map((product, idx) => (
                            <div key={idx} className="flex items-center gap-2 mt-1">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              <span>{product.name} x {product.quantity}</span>
                            </div>
                          )) || 'No products available'}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>

        {filteredTransactions.length === 0 && (
          <div 
            className={`text-center py-8 transition-all duration-500 transform ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No transaction records match your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 
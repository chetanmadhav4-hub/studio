import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const recentOrders = [
  {
    id: "INSTA-892341",
    customer: "+91 9876543210",
    service: "Instagram Followers",
    quantity: 1000,
    amount: "₹120",
    status: "Completed",
    date: "2024-05-20 14:22",
  },
  {
    id: "INSTA-892342",
    customer: "+91 9123456789",
    service: "Instagram Followers",
    quantity: 500,
    amount: "₹60",
    status: "Processing",
    date: "2024-05-20 15:10",
  },
  {
    id: "INSTA-892343",
    customer: "+91 9988776655",
    service: "Instagram Followers",
    quantity: 2500,
    amount: "₹300",
    status: "Pending Payment",
    date: "2024-05-20 16:05",
  },
  {
    id: "INSTA-892344",
    customer: "+91 9000011111",
    service: "Instagram Followers",
    quantity: 100,
    amount: "₹12",
    status: "Failed",
    date: "2024-05-20 16:45",
  },
];

export function RecentOrders() {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium text-primary">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.service}</TableCell>
              <TableCell className="text-right">{order.quantity}</TableCell>
              <TableCell className="text-right">{order.amount}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    order.status === "Completed" ? "default" :
                    order.status === "Processing" ? "secondary" :
                    order.status === "Failed" ? "destructive" : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
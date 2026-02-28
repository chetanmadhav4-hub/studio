
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

export function RecentOrders() {
  const db = useFirestore();

  // Fetch 10 most recent orders globally using collection group query
  const recentOrdersQuery = useMemoFirebase(() => {
    return query(
      collectionGroup(db, 'orders'), 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
  }, [db]);

  const { data: orders, isLoading, error } = useCollection(recentOrdersQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching latest orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">Failed to load orders.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-primary">{order.id}</TableCell>
                <TableCell className="max-w-[150px] truncate">{order.serviceName}</TableCell>
                <TableCell className="text-right">{order.quantity}</TableCell>
                <TableCell className="text-right">₹{order.price}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "COMPLETED" ? "default" :
                      order.status === "PROCESSING" ? "secondary" :
                      order.status === "FAILED" ? "destructive" : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                    : 'Recent'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

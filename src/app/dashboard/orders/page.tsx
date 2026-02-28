'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminOrdersPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useMemoFirebase(() => {
    return query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: allOrders, isLoading, error } = useCollection(ordersQuery);

  const filteredOrders = allOrders?.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.targetLink?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.utrId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
        <p className="text-muted-foreground">View and track all SMM orders across the platform.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">All Orders ({allOrders?.length || 0})</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Link, or UTR..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Loading orders data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-destructive">
              <AlertCircle className="w-10 h-10" />
              <p className="text-lg font-bold">Error Loading Orders</p>
              <p className="text-sm">Please check your permissions or network connection.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[140px]">Order ID</TableHead>
                  <TableHead>Service Info</TableHead>
                  <TableHead>Target Link</TableHead>
                  <TableHead>Payment Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono font-bold text-primary">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{order.serviceName}</span>
                          <span className="text-xs text-muted-foreground">Qty: {order.quantity.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.targetLink ? (
                          <a 
                            href={order.targetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline max-w-[200px] truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {order.targetLink}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">₹{order.price}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">UTR: {order.utrId || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.status === "COMPLETED" ? "default" :
                            order.status === "PROCESSING" ? "secondary" :
                            order.status === "FAILED" ? "destructive" : "outline"
                          }
                          className="capitalize text-[10px] font-bold"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {order.createdAt?.seconds 
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Recent'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 opacity-20" />
                        <p>No orders found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

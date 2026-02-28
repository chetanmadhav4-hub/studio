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
import { Loader2, AlertCircle, ExternalLink, Search, Hash, Link as LinkIcon, User } from "lucide-react";
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
    order.utrId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Orders List</h2>
        <p className="text-sm text-muted-foreground">Manage and track all SMM orders placed by users.</p>
      </div>

      <Card className="bg-white shadow-sm border-none">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Total Orders: {allOrders?.length || 0}
          </CardTitle>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Link, or UTR..."
              className="pl-9 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-destructive">
              <AlertCircle className="w-10 h-10" />
              <p className="text-lg font-bold">Access Denied</p>
              <p className="text-sm opacity-80">Check Firestore permissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="w-[150px]">Order ID</TableHead>
                    <TableHead>Service & Qty</TableHead>
                    <TableHead>Target Link</TableHead>
                    <TableHead>UTR ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/5 transition-colors">
                        <TableCell className="font-bold text-primary text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm">{order.serviceName}</span>
                            <Badge variant="secondary" className="w-fit text-[10px] h-4">
                              Qty: {order.quantity.toLocaleString()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.targetLink ? (
                            <a 
                              href={order.targetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline max-w-[220px] truncate font-medium"
                            >
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              {order.targetLink}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No link</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs bg-muted/30 px-2 py-1 rounded">
                            {order.utrId || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-sm text-emerald-600">₹{order.price}</span>
                        </TableCell>
                        <TableCell className="text-right text-[10px] text-muted-foreground">
                          {order.createdAt?.seconds 
                            ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                            : 'Just now'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
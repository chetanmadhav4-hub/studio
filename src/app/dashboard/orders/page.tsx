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
import { Loader2, AlertCircle, Search, Hash, Link as LinkIcon, User, CreditCard } from "lucide-react";
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
    order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Manage All Orders</h2>
        <p className="text-sm text-slate-500">View detailed information about every SMM order placed.</p>
      </div>

      <Card className="bg-white shadow-xl border-none overflow-hidden rounded-2xl">
        <CardHeader className="pb-4 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Total Orders: {allOrders?.length || 0}
          </CardTitle>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID, Link, UTR or Service..."
              className="pl-9 h-11 text-sm bg-slate-50 border-slate-200 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-500">Fetching live orders from Firestore...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Permission Denied</p>
                <p className="text-sm text-slate-500 max-w-sm">
                  We couldn't load the orders. Please ensure you are logged in as an admin and Firestore Security Rules are correctly applied.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="w-[120px] font-bold text-slate-600">ORDER ID</TableHead>
                    <TableHead className="font-bold text-slate-600">USER / PHONE</TableHead>
                    <TableHead className="font-bold text-slate-600">SERVICE DETAILS</TableHead>
                    <TableHead className="font-bold text-slate-600">TARGET LINK</TableHead>
                    <TableHead className="font-bold text-slate-600">PAYMENT / UTR</TableHead>
                    <TableHead className="text-right font-bold text-slate-600">DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                        <TableCell className="font-bold text-primary text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {order.phoneNumber || 'User'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-slate-900">{order.serviceName}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] h-4 bg-primary/5 text-primary border-none">
                                Qty: {order.quantity.toLocaleString()}
                              </Badge>
                              <span className="font-bold text-xs text-emerald-600">₹{order.price}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.targetLink ? (
                            <a 
                              href={order.targetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline max-w-[200px] truncate font-medium bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/50"
                            >
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              {order.targetLink}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No link provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                              <CreditCard className="w-3 h-3 text-slate-500" />
                              {order.utrId || 'N/A'}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold ml-1">UTR ID</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-700">
                              {order.createdAt?.seconds 
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                : 'Recent'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {order.createdAt?.seconds 
                                ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-24 text-slate-400 font-medium">
                        No orders match your search criteria.
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
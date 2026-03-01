
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
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
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  // FIX: ONLY query if user is actually the admin to prevent permission issues
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, 'all_orders'), orderBy('createdAt', 'desc'));
  }, [db, user?.email]);

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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage All Orders</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">View detailed information about every SMM order placed.</p>
      </div>

      <Card className="bg-white dark:bg-zinc-900 shadow-xl border-none overflow-hidden rounded-2xl transition-colors">
        <CardHeader className="pb-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-white">
            <Hash className="w-4 h-4 text-primary" />
            Total Orders: {allOrders?.length || 0}
          </CardTitle>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID, Link, UTR or Service..."
              className="pl-9 h-11 text-sm bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 dark:text-white focus:bg-white dark:focus:bg-zinc-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-500">Fetching live orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Access Denied</p>
                <p className="text-sm text-slate-500 max-w-sm">
                  Orders dashboard is only for admin users.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                  <TableRow className="border-b dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="w-[120px] font-bold text-slate-600 dark:text-slate-400">ORDER ID</TableHead>
                    <TableHead className="font-bold text-slate-600 dark:text-slate-400">USER / PHONE</TableHead>
                    <TableHead className="font-bold text-slate-600 dark:text-slate-400">SERVICE DETAILS</TableHead>
                    <TableHead className="font-bold text-slate-600 dark:text-slate-400">TARGET LINK</TableHead>
                    <TableHead className="font-bold text-slate-600 dark:text-slate-400">PAYMENT / UTR</TableHead>
                    <TableHead className="text-right font-bold text-slate-600 dark:text-slate-400">DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors border-b dark:border-zinc-800">
                        <TableCell className="font-bold text-primary dark:text-accent text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {order.phoneNumber || 'User'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{order.serviceName}</span>
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
                              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-accent hover:underline max-w-[200px] truncate font-medium bg-blue-50/50 dark:bg-accent/10 p-1.5 rounded-lg border border-blue-100/50 dark:border-accent/20"
                            >
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              {order.targetLink}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No link</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit border border-slate-200 dark:border-zinc-700 dark:text-white">
                              <CreditCard className="w-3 h-3 text-slate-500" />
                              {order.utrId || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {order.createdAt?.seconds 
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                : 'Recent'}
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

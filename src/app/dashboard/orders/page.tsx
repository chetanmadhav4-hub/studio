
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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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

  if (isUserLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar pb-32">
      <div className="space-y-6 max-w-7xl mx-auto pt-4 px-4 sm:px-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 uppercase">Manage All Orders</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Full Transaction History</p>
        </div>

        <Card className="bg-white dark:bg-zinc-900 shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
          <CardHeader className="pb-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-sm font-black flex items-center gap-2 dark:text-zinc-50 uppercase tracking-tight">
              <Hash className="w-4 h-4 text-primary" />
              Total Orders: {allOrders?.length || 0}
            </CardTitle>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search Orders..."
                className="pl-9 h-12 text-[11px] font-black uppercase tracking-widest bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl dark:text-zinc-50 focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching live orders...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-xl font-black uppercase dark:text-zinc-50">Access Denied</p>
              </div>
            ) : (
              <div className="overflow-x-auto touch-pan-x custom-scrollbar">
                <div className="min-w-[1000px] p-2">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                      <TableRow className="border-b dark:border-zinc-800 hover:bg-transparent">
                        <TableHead className="w-[120px] font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">ORDER ID</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">USER / PHONE</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">SERVICE DETAILS</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">TARGET LINK</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">PAYMENT / UTR</TableHead>
                        <TableHead className="text-right font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">DATE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders && filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors border-b dark:border-zinc-800">
                            <TableCell className="font-black text-primary dark:text-accent text-[11px] uppercase tracking-tighter">
                              #{order.id.slice(-6)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-black text-slate-700 dark:text-zinc-200">
                                  +{order.phoneNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-black text-[11px] text-slate-900 dark:text-zinc-50 uppercase tracking-tight">{order.serviceName}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[9px] h-4 bg-primary/5 text-primary border-none font-black uppercase">
                                    {order.quantity.toLocaleString()}
                                  </Badge>
                                  <span className="font-black text-[10px] text-emerald-600">₹{order.price}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a 
                                href={order.targetLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-accent hover:underline max-w-[200px] truncate font-black uppercase tracking-tight"
                              >
                                <LinkIcon className="w-3 h-3 shrink-0" />
                                {order.targetLink}
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-[10px] font-black font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded border dark:border-zinc-700 dark:text-zinc-50">
                                <CreditCard className="w-3 h-3 text-slate-400" />
                                {order.utrId || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                                {order.createdAt?.seconds 
                                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                  : 'Recent'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-24 text-slate-400 font-black uppercase tracking-widest italic">
                            No orders matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

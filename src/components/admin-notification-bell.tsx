
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { 
  Bell, 
  ShoppingBag,
  Zap,
  ArrowRight
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminNotificationBell() {
  const { user } = useUser();
  const db = useFirestore();
  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  // FIX: ONLY query if user is actually the admin to prevent permission errors
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(
      collection(db, 'all_orders'), 
      where('status', '==', 'PROCESSING'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user?.email]);

  const { data: newOrders, isLoading } = useCollection(ordersQuery);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (newOrders && newOrders.length > prevCount) {
      // Audio notification (subtle)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
      setPrevCount(newOrders.length);
    } else if (!newOrders || newOrders.length === 0) {
      setPrevCount(0);
    }
  }, [newOrders, prevCount]);

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 rounded-full hover:bg-accent transition-colors bg-white dark:bg-zinc-900 border dark:border-zinc-800">
          <Bell className="w-5 h-5 text-primary" />
          {newOrders && newOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 animate-bounce">
              {newOrders.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl overflow-hidden shadow-2xl border-none mt-2 dark:bg-zinc-950" align="end">
        <div className="bg-red-600 p-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">New Order Alerts</h4>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold border-none uppercase">
            ADMIN ONLY
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 max-h-80 overflow-y-auto space-y-3">
          {newOrders && newOrders.length > 0 ? (
            <>
              {newOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary dark:text-accent uppercase">
                      {order.serviceName}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">
                      {order.createdAt?.seconds 
                        ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                    Order ID: {order.id.slice(-6)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate italic">
                    By: +{order.phoneNumber}
                  </p>
                </div>
              ))}
              <Link href="/orders-feed">
                <Button className="w-full mt-2 h-9 text-xs font-bold gap-2 rounded-xl group">
                  Go to Live Tracker
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-100 dark:text-zinc-800 mx-auto" />
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium italic">No new orders waiting.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

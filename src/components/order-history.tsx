
'use client';

import { useMemoFirebase, useCollection, useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Clock } from 'lucide-react';

export function OrderHistory() {
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  if (!user) return null;

  return (
    <div className="w-full py-2">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Clock className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-0.5 max-w-[60%]">
                <p className="text-[11px] font-black text-primary dark:text-emerald-400 uppercase truncate leading-tight">
                  {order.serviceName}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground dark:text-zinc-400 font-bold uppercase">
                  <span>Qty: {order.quantity}</span>
                  <span>•</span>
                  <span className="text-slate-900 dark:text-zinc-50">₹{order.price}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="secondary" className="text-[8px] font-black px-1.5 py-0 h-4 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg">
                  {order.id.slice(-6)}
                </Badge>
                <p className="text-[8px] text-muted-foreground dark:text-zinc-500 font-bold uppercase tracking-tighter">
                  {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })
                    : 'Just now'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-5 h-5 text-muted-foreground dark:text-zinc-500" />
          </div>
          <p className="text-[10px] text-muted-foreground dark:text-zinc-400 font-bold uppercase tracking-widest px-4">
            Aapne abhi tak koi order nahi lagaya hai.
          </p>
        </div>
      )}
    </div>
  );
}

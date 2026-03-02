
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
    <div className="w-full py-1">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Clock className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-0.5 max-w-[65%]">
                <p className="text-[10px] font-black text-primary dark:text-accent uppercase truncate leading-tight">
                  {order.serviceName}
                </p>
                <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground dark:text-zinc-400 font-black uppercase tracking-tight">
                  <span>QTY: {order.quantity}</span>
                  <span className="opacity-30">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{order.price}</span>
                </div>
              </div>
              <div className="text-right space-y-0.5 shrink-0">
                <Badge variant="secondary" className="text-[7px] font-black px-1.5 py-0 h-3.5 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg">
                  #{order.id.slice(-6)}
                </Badge>
                <p className="text-[7px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-tighter">
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
        <div className="text-center py-16 space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200 dark:border-zinc-800">
            <ShoppingBag className="w-6 h-6 text-muted-foreground dark:text-zinc-500" />
          </div>
          <p className="text-[10px] text-muted-foreground dark:text-zinc-400 font-black uppercase tracking-widest px-8 leading-relaxed opacity-60">
            Aapne abhi tak koi order nahi lagaya hai.
          </p>
        </div>
      )}
    </div>
  );
}

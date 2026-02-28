
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
    <div className="w-full py-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Clock className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary dark:text-emerald-400">{order.serviceName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-400">
                  <span>Qty: {order.quantity}</span>
                  <span>•</span>
                  <span className="font-semibold text-foreground dark:text-zinc-100">₹{order.price}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 dark:bg-zinc-800 dark:text-zinc-300">
                  {order.id}
                </Badge>
                <p className="text-[10px] text-muted-foreground dark:text-zinc-500">
                  {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
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
          <div className="w-12 h-12 bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6 text-muted-foreground dark:text-zinc-500" />
          </div>
          <p className="text-sm text-muted-foreground dark:text-zinc-400">
            Aapne abhi tak koi order nahi lagaya hai.
          </p>
        </div>
      )}
    </div>
  );
}

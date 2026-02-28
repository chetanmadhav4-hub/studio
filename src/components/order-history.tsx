
'use client';

import { useMemoFirebase, useCollection, useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Clock, ExternalLink } from 'lucide-react';

export function OrderHistory() {
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  if (!user) return null;

  return (
    <Card className="w-full bg-white/50 backdrop-blur-sm border-dashed border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          Recent Orders History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Clock className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-white border shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary">{order.serviceName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Qty: {order.quantity}</span>
                    <span>•</span>
                    <span>₹{order.price}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {order.id}
                  </Badge>
                  <p className="text-[9px] text-muted-foreground">
                    {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-4">
            No orders found yet. Start chatting with the bot!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

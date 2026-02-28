
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, CreditCard, Clock, Loader2 } from "lucide-react";

export function StatsCards() {
  const db = useFirestore();

  // Fetch all orders across all users to calculate stats
  const ordersQuery = useMemoFirebase(() => {
    return query(collectionGroup(db, 'orders'));
  }, [db]);

  const { data: allOrders, isLoading } = useCollection(ordersQuery);

  const totalOrders = allOrders?.length || 0;
  const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;
  
  // Mock users count (In a real app, query /users collection)
  const usersCount = 452; 

  const stats = [
    {
      title: "Total Orders",
      value: isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : totalOrders.toLocaleString(),
      icon: ShoppingBag,
      description: "Lifetime total orders",
    },
    {
      title: "Active Users",
      value: usersCount.toLocaleString(),
      icon: Users,
      description: "Registered on WhatsApp",
    },
    {
      title: "Total Revenue",
      value: isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      description: "Gross lifetime earnings",
    },
    {
      title: "Avg. Delivery",
      value: "18m",
      icon: Clock,
      description: "SMM Panel performance",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

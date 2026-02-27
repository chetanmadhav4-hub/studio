import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, CreditCard, Clock } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,284",
      icon: ShoppingBag,
      description: "+12.5% from last month",
    },
    {
      title: "Active Users",
      value: "452",
      icon: Users,
      description: "WhatsApp active sessions",
    },
    {
      title: "Revenue",
      value: "₹15,240",
      icon: CreditCard,
      description: "Last 30 days",
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
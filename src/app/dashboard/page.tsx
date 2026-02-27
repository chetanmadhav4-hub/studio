import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Monitor your WhatsApp bot performance and orders.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-white">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 bg-white">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">WhatsApp API Status</span>
                <span className="text-green-500 font-medium">Healthy</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[98%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SMM Panel Response Time</span>
                <span className="text-green-500 font-medium">1.2s</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[94%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Success Rate</span>
                <span className="text-amber-500 font-medium">88%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[88%]" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-4">Latest Logs</h4>
              <div className="space-y-3">
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">14:52:12</span>
                  <span className="text-blue-500 font-medium">[BOT]</span>
                  <span>Replied to +919876543210: "Welcome to InstaFlow..."</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">14:50:05</span>
                  <span className="text-green-500 font-medium">[PAY]</span>
                  <span>Payment confirmed for Order ID INSTA-892341</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">14:48:30</span>
                  <span className="text-purple-500 font-medium">[SMM]</span>
                  <span>Placed order 1000 Followers for @userprofile</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
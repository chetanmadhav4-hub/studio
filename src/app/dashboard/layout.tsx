import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  MessageSquare, 
  BarChart3,
  LogOut,
  Zap
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-primary">InstaFlow</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Orders">
                <Link href="/dashboard/orders" className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Conversations">
                <Link href="/dashboard/chat" className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Sessions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Analytics">
                <Link href="/dashboard/analytics" className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/dashboard/settings" className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="mt-auto pt-4 border-t">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-destructive hover:text-destructive">
                <Link href="/" className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="h-16 border-b bg-white flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">InstaFlow Admin Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full border border-accent/20">
              BOT ACTIVE
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              JD
            </div>
          </div>
        </header>
        <main className="p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
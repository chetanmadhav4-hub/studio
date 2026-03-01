"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { Zap, History, Moon, Sun, LayoutGrid, Users, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [isDark, setIsDark] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background transition-colors duration-300 overflow-hidden">
      {/* Sleek App Header */}
      <header className="h-14 border-b bg-white dark:bg-zinc-950 flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-primary uppercase italic">InstaFlow</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isUserLoading ? (
            <>
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs h-8 font-bold">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-xs h-8 font-bold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full hover:bg-accent dark:hover:bg-zinc-800 transition-colors"
                    onClick={toggleTheme}
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-primary" />}
                  </Button>

                  <NotificationBell />
                  
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-0.5 rounded-full border-2 border-primary/10 ml-1">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-[10px] bg-primary text-white font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>
      </header>

      {/* Main App Surface */}
      <main className="flex-1 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-lg h-full bg-white dark:bg-background relative flex flex-col shadow-2xl">
          
          {isAdmin ? (
            <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-hide">
              <div className="space-y-1 mb-2">
                <h1 className="text-2xl font-black text-foreground dark:text-white uppercase">Control Center</h1>
                <p className="text-xs text-muted-foreground font-medium italic">Manage orders and user data instantly.</p>
              </div>

              <div className="grid gap-4">
                <Link href="/orders-feed">
                  <Card className="hover:scale-[1.02] transition-all border-none shadow-lg bg-emerald-600 dark:bg-emerald-700 text-white overflow-hidden group">
                    <CardHeader className="p-5">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight">Live Tracker</CardTitle>
                      <CardDescription className="text-emerald-50 text-xs font-medium opacity-80">Approve or reject payments in real-time.</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/users">
                  <Card className="hover:scale-[1.02] transition-all border-none shadow-lg bg-primary dark:bg-primary/80 text-white overflow-hidden group">
                    <CardHeader className="p-5">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight">Registered Users</CardTitle>
                      <CardDescription className="text-blue-50 text-xs font-medium opacity-80">Monitor growth and view all registration data.</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F0F2F5] dark:bg-zinc-950">
              {/* User Sub-Header */}
              {user && (
                <div className="h-10 bg-white dark:bg-zinc-900 border-b flex items-center px-4 justify-between shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">Bot Interface</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[10px] font-bold hover:bg-primary/5 text-primary dark:text-accent">
                        <History className="w-3 h-3" /> My History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-3xl dark:bg-zinc-950">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 dark:text-zinc-100 text-sm">
                          <History className="w-4 h-4 text-primary" />
                          Order History
                        </DialogTitle>
                      </DialogHeader>
                      <OrderHistory />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Pure Bot Experience */}
              <div className="flex-1 relative">
                <BotPreview isAppMode={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Bottom Bar */}
      <footer className="h-10 bg-white dark:bg-zinc-950 border-t flex items-center justify-center shrink-0">
        <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase tracking-[0.2em]">
          Powered by InstaFlow Automation
        </p>
      </footer>
    </div>
  );
}
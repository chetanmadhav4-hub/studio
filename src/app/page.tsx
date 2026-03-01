
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { AdminNotificationBell } from "@/components/admin-notification-bell";
import { CheckCircle2, Zap, History, Moon, Sun, LayoutGrid, Users, ArrowRight } from "lucide-react";
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
  const isAdmin = user?.email === ADMIN_EMAIL;

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
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">InstaFlow</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {!isUserLoading && (
              <>
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-sm dark:text-zinc-300">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full hover:bg-accent dark:hover:bg-zinc-800"
                      onClick={toggleTheme}
                    >
                      {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
                    </Button>

                    <NotificationBell />
                    
                    {isAdmin && <AdminNotificationBell />}

                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 text-sm p-1 ml-1">
                        <Avatar className="w-7 h-7 border dark:border-zinc-800">
                          <AvatarFallback className="text-[10px] bg-primary text-white">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-white to-background dark:from-zinc-950 dark:to-background pt-8 pb-12 md:pt-16 md:pb-20 transition-colors flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-white leading-tight">
                {isAdmin ? "Admin Control Center" : "Welcome to InstaFlow"}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground dark:text-zinc-400 max-w-xl mx-auto">
                {isAdmin 
                  ? "Manage orders and monitor user growth in real-time." 
                  : "Join thousands of users who grow their social media presence automatically."}
              </p>
            </div>

            {isAdmin ? (
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <Link href="/orders-feed">
                  <Card className="hover:shadow-2xl transition-all cursor-pointer group border-primary/20 bg-white dark:bg-zinc-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-24 h-24" />
                    </div>
                    <CardHeader className="text-left">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-none">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold dark:text-white">LIVE TRACKER (ऑर्डर)</CardTitle>
                      <CardDescription className="dark:text-zinc-400">Manage pending orders, approve or reject payments instantly.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-left">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 w-full group-hover:gap-4 transition-all">
                        Open Tracker <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/users">
                  <Card className="hover:shadow-2xl transition-all cursor-pointer group border-primary/20 bg-white dark:bg-zinc-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Users className="w-24 h-24" />
                    </div>
                    <CardHeader className="text-left">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 dark:shadow-none">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold dark:text-white">REGISTERED USERS</CardTitle>
                      <CardDescription className="dark:text-zinc-400">View your growing community and manage user profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-left">
                      <Button className="w-full group-hover:gap-4 transition-all">
                        View All Users <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ) : (
              <>
                {user ? (
                  <div className="flex justify-center flex-col items-center gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 shadow-sm border-primary/20 text-primary hover:text-primary hover:bg-primary/5 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 text-xs h-9">
                          <History className="w-4 h-4" />
                          View Order History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl dark:bg-zinc-950 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
                            <History className="w-5 h-5 text-primary" />
                            My Orders
                          </DialogTitle>
                        </DialogHeader>
                        <OrderHistory />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : null}

                <div className="w-full max-w-[420px] mx-auto mt-2 transition-all">
                  <BotPreview />
                </div>

                <div className="hidden sm:flex items-center justify-center gap-8 pt-8 opacity-60">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Instant Delivery
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    24/7 Automation
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 border-t dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-base tracking-tight text-primary">InstaFlow Bot</span>
          </div>
          <p className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-widest font-bold">
            © 2024 InstaFlow Automation
          </p>
        </div>
      </footer>
    </div>
  );
}

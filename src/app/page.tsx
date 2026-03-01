
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { CheckCircle2, Zap, History, Moon, Sun, LayoutGrid, Users, ArrowRight, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 overflow-x-hidden">
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-primary">InstaFlow</span>
          </div>
          
          <div className="flex items-center gap-1">
            {!isUserLoading ? (
              <>
                {!user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-xs h-8">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-xs h-8">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-accent dark:hover:bg-zinc-800"
                      onClick={toggleTheme}
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-primary" />}
                    </Button>

                    <NotificationBell />
                    
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 text-xs p-1 ml-1">
                        <Avatar className="w-7 h-7 border dark:border-zinc-800">
                          <AvatarFallback className="text-[9px] bg-primary text-white">
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
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="bg-gradient-to-b from-white to-background dark:from-zinc-950 dark:to-background py-4 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground dark:text-white leading-tight">
                  {isAdmin ? "Admin Center" : "Welcome to InstaFlow"}
                </h1>
                <p className="text-sm text-muted-foreground dark:text-zinc-400 max-w-lg mx-auto">
                  {isAdmin 
                    ? "Manage orders and monitor growth." 
                    : "Social media automation on WhatsApp."}
                </p>
              </div>

              {isAdmin ? (
                <div className="grid md:grid-cols-2 gap-4 mt-4 px-2">
                  <Link href="/orders-feed">
                    <Card className="hover:shadow-lg transition-all border-primary/10 bg-white dark:bg-zinc-900 overflow-hidden text-left h-full">
                      <CardHeader className="p-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mb-2">
                          <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold dark:text-white uppercase">Live Tracker</CardTitle>
                        <CardDescription className="text-xs dark:text-zinc-400">Approve or reject payments instantly.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 w-full text-xs h-9">
                          Open Tracker
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard/users">
                    <Card className="hover:shadow-lg transition-all border-primary/10 bg-white dark:bg-zinc-900 overflow-hidden text-left h-full">
                      <CardHeader className="p-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold dark:text-white uppercase">User Data</CardTitle>
                        <CardDescription className="text-xs dark:text-zinc-400">View and manage all registered users.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button size="sm" className="w-full text-xs h-9">
                          View All Users
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {user && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 shadow-sm border-primary/20 text-primary hover:bg-primary/5 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 text-xs h-8">
                          <History className="w-3.5 h-3.5" />
                          Order History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] md:max-w-md max-h-[80vh] overflow-y-auto rounded-2xl dark:bg-zinc-950 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 dark:text-zinc-100 text-sm">
                            <History className="w-4 h-4 text-primary" />
                            My Orders
                          </DialogTitle>
                        </DialogHeader>
                        <OrderHistory />
                      </DialogContent>
                    </Dialog>
                  )}

                  <div className="w-full mt-2 transform scale-95 sm:scale-100 transition-transform">
                    <BotPreview />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 border-t dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors shrink-0">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[9px] text-muted-foreground dark:text-zinc-500 uppercase tracking-widest font-bold">
            © 2024 InstaFlow Automation
          </p>
        </div>
      </footer>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { Zap, History, Moon, Sun, LayoutGrid, Users, Loader2, Megaphone, X } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
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
  const db = useFirestore();
  const [isDark, setIsDark] = useState(false);
  const [isBroadcastDismissed, setIsBroadcastDismissed] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const broadcastRef = doc(db, 'settings', 'broadcast');
  const { data: broadcast } = useDoc(broadcastRef);

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
      {/* Real-time Broadcast Overlay */}
      {broadcast?.isBroadcastActive && !isBroadcastDismissed && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-[100] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-primary dark:bg-accent p-4 rounded-2xl shadow-2xl border-2 border-white/20 flex items-start gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="flex-1 space-y-1 pr-4">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Official Update</p>
              <p className="text-xs font-bold text-white dark:text-zinc-100 leading-relaxed">
                {broadcast.broadcastMessage}
              </p>
            </div>
            <button 
              onClick={() => setIsBroadcastDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

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

      {/* Main App Surface - Centered Mobile Frame */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-start py-4">
        <div className="w-full max-w-[420px] h-full bg-white dark:bg-background relative flex flex-col shadow-2xl border dark:border-zinc-800 rounded-[2rem] overflow-hidden">
          
          {isAdmin ? (
            <div className="p-6 space-y-4 overflow-y-auto h-full scrollbar-hide">
              <div className="space-y-1 mb-2">
                <h1 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tight">Admin Console</h1>
                <p className="text-[10px] text-muted-foreground font-bold italic uppercase">Manage Orders & Growth</p>
              </div>

              <div className="grid gap-4">
                <Link href="/orders-feed">
                  <Card className="hover:scale-[1.01] transition-all border-none shadow-lg bg-emerald-600 dark:bg-emerald-700 text-white overflow-hidden group">
                    <CardHeader className="p-5 text-left">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                        <LayoutGrid className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Live Tracker</CardTitle>
                      <CardDescription className="text-emerald-50 text-[10px] font-bold opacity-80 uppercase">Manage Incoming Orders</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/broadcast">
                  <Card className="hover:scale-[1.01] transition-all border-none shadow-lg bg-primary dark:bg-primary/80 text-white overflow-hidden group">
                    <CardHeader className="p-5 text-left">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Broadcast Msg</CardTitle>
                      <CardDescription className="text-blue-50 text-[10px] font-bold opacity-80 uppercase">Edit Live Announcements</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/users">
                  <Card className="hover:scale-[1.01] transition-all border-none shadow-lg bg-zinc-800 dark:bg-zinc-900 text-white overflow-hidden group">
                    <CardHeader className="p-5 text-left">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight text-white">User Database</CardTitle>
                      <CardDescription className="text-zinc-300 text-[10px] font-bold opacity-80 uppercase">Registered User Profiles</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F0F2F5] dark:bg-zinc-950">
              {/* User Sub-Header */}
              {user && (
                <div className="h-10 bg-white dark:bg-zinc-900 border-b flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                  <span className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-[0.2em]">Automated Bot</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[10px] font-black hover:bg-primary/5 text-primary dark:text-accent uppercase">
                        <History className="w-3 h-3" /> History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto rounded-[2rem] dark:bg-zinc-950 border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 dark:text-zinc-100 text-sm font-black uppercase tracking-wider">
                          <History className="w-4 h-4 text-primary" />
                          Recent Orders
                        </DialogTitle>
                      </DialogHeader>
                      <OrderHistory />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Bot Interaction Area - FULL HEIGHT, INTERNAL SCROLL ONLY */}
              <div className="flex-1 relative overflow-hidden">
                <BotPreview isAppMode={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal App Footer */}
      <footer className="h-8 bg-white dark:bg-zinc-950 border-t flex items-center justify-center shrink-0">
        <p className="text-[8px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-[0.4em]">
          InstaFlow App v2.0
        </p>
      </footer>
    </div>
  );
}

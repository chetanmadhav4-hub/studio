
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { NotificationBell } from "@/components/notification-bell";
import { Zap, History, Moon, Sun, LayoutGrid, Users, Loader2, Megaphone, X, ArrowRight } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
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

  const broadcastRef = useMemoFirebase(() => doc(db, 'settings', 'broadcast'), [db]);
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

  useEffect(() => {
    if (broadcast?.broadcastMessage && broadcast?.isBroadcastActive) {
      setIsBroadcastDismissed(false);
    }
  }, [broadcast?.broadcastMessage, broadcast?.updatedAt, broadcast?.isBroadcastActive]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background dark:bg-zinc-950 transition-colors duration-300 overflow-hidden font-body relative">
      
      {/* REAL-TIME BROADCAST POPUP */}
      {broadcast?.isBroadcastActive && !isBroadcastDismissed && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[999] animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="bg-primary dark:bg-zinc-900 p-4 sm:p-5 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-2 border-white/20 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Megaphone className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="flex-1 space-y-1 pr-6">
              <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Official Announcement</p>
              <p className="text-xs sm:text-sm font-bold text-white dark:text-zinc-50 leading-snug">
                {broadcast.broadcastMessage}
              </p>
            </div>
            <button 
              onClick={() => setIsBroadcastDismissed(true)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-all border border-white/10 active:scale-90"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* APP HEADER - SAFE AREA FIXED */}
      <header className="h-24 pt-[env(safe-area-inset-top,24px)] pb-3 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0 shadow-sm z-[100] relative">
        <div className="flex items-center gap-2 mt-auto">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="font-black text-base sm:text-lg tracking-tighter text-primary dark:text-accent uppercase italic">InstaFlow</span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-auto">
          {!isUserLoading ? (
            <>
              {!user ? (
                <div className="flex items-center gap-1.5">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs h-9 font-bold dark:text-zinc-300">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-[10px] sm:text-xs h-9 font-black px-3 sm:px-4 rounded-xl shadow-md">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-accent/10 dark:hover:bg-zinc-800 transition-colors"
                    onClick={toggleTheme}
                  >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
                  </Button>

                  <NotificationBell />
                  
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-0.5 rounded-full border-2 border-primary/20 ml-0.5">
                      <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                        <AvatarFallback className="text-[10px] sm:text-[11px] bg-primary text-white font-black">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          )}
        </div>
      </header>

      {/* MOBILE APP INTERFACE */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-start p-0 relative">
        <div className="w-full max-w-[440px] h-full bg-white dark:bg-zinc-900 relative flex flex-col shadow-2xl sm:border dark:border-zinc-800 overflow-hidden">
          
          {isAdmin ? (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto h-full scrollbar-hide bg-[#F8F9FC] dark:bg-zinc-950">
              <div className="space-y-1 mb-2 pt-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Panel</h1>
                <p className="text-[10px] sm:text-[11px] text-primary dark:text-accent font-black uppercase tracking-widest italic opacity-80">Management Hub v2.0</p>
              </div>

              <div className="grid gap-3 sm:gap-4 pb-10">
                <Link href="/orders-feed" className="block w-full">
                  <Card className="hover:scale-[1.01] active:scale-95 transition-all border-none shadow-xl bg-emerald-600 dark:bg-emerald-800 text-white overflow-hidden h-28 sm:h-32 flex items-center cursor-pointer">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-5 w-full space-y-0">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Live Tracker</CardTitle>
                        <CardDescription className="text-emerald-50 text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">Approve & Reject Orders</CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 ml-auto opacity-40" />
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/broadcast" className="block w-full">
                  <Card className="hover:scale-[1.01] active:scale-95 transition-all border-none shadow-xl bg-primary dark:bg-primary/80 text-white overflow-hidden h-28 sm:h-32 flex items-center cursor-pointer">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-5 w-full space-y-0">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                        <Megaphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Broadcast Msg</CardTitle>
                        <CardDescription className="text-blue-50 text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">Real-time Announcements</CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 ml-auto opacity-40" />
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/users" className="block w-full">
                  <Card className="hover:scale-[1.01] active:scale-95 transition-all border-none shadow-xl bg-zinc-800 dark:bg-zinc-900 text-white overflow-hidden h-28 sm:h-32 flex items-center border dark:border-zinc-700 cursor-pointer">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-5 w-full space-y-0">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg font-black uppercase tracking-tight text-white">All Users</CardTitle>
                        <CardDescription className="text-zinc-300 text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">Database & Contact List</CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 ml-auto opacity-40" />
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F0F2F5] dark:bg-zinc-950">
              {/* USER ACTION BAR */}
              {user && (
                <div className="h-10 sm:h-12 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                  <span className="text-[9px] sm:text-[10px] font-black text-primary dark:text-accent uppercase tracking-[0.2em] italic">Automated Assistant</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[10px] sm:text-[11px] font-black hover:bg-primary/5 text-primary dark:text-accent uppercase tracking-wider">
                        <History className="w-3.5 h-3.5" /> Recent Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-[2.5rem] dark:bg-zinc-950 border-none shadow-2xl p-6">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 dark:text-zinc-50 text-base font-black uppercase tracking-tighter">
                          <History className="w-5 h-5 text-primary" />
                          Order History
                        </DialogTitle>
                      </DialogHeader>
                      <OrderHistory />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* CHAT INTERFACE AREA */}
              <div className="flex-1 relative overflow-hidden">
                <BotPreview isAppMode={true} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* COMPACT APP FOOTER */}
      <footer className="h-12 bg-white dark:bg-zinc-950 border-t dark:border-zinc-900 flex items-center justify-center shrink-0 z-[100] pb-[env(safe-area-inset-bottom,10px)]">
        <p className="text-[7px] sm:text-[8px] text-muted-foreground dark:text-zinc-600 font-black uppercase tracking-[0.5em] opacity-50">
          InstaFlow Engine v2.0 • Secure SMM
        </p>
      </footer>
    </div>
  );
}

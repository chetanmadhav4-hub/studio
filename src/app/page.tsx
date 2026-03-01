
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
              <p className="text-xs sm:text-sm font-black text-white dark:text-zinc-50 leading-snug">
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
      <header className="h-28 pt-[calc(env(safe-area-inset-top,24px)+4px)] pb-3 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5 shrink-0 shadow-sm z-[100] relative">
        <div className="flex items-center gap-2.5 mt-auto pb-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tighter text-primary dark:text-accent uppercase italic">InstaFlow</span>
        </div>
        
        <div className="flex items-center gap-2 mt-auto pb-1">
          {!isUserLoading ? (
            <>
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs h-9 font-black uppercase dark:text-zinc-300">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-[10px] sm:text-xs h-9 font-black px-4 rounded-xl shadow-md uppercase">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full hover:bg-accent/10 dark:hover:bg-zinc-800 transition-colors"
                    onClick={toggleTheme}
                  >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-primary" />}
                  </Button>

                  <NotificationBell />
                  
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-0.5 rounded-full border-2 border-primary/20 ml-0.5 shadow-sm">
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
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
        </div>
      </header>

      {/* MOBILE APP INTERFACE */}
      <main className="flex-1 overflow-hidden flex flex-col items-center justify-start p-0 relative">
        <div className="w-full max-w-[440px] h-full bg-white dark:bg-zinc-900 relative flex flex-col shadow-2xl sm:border dark:border-zinc-800 overflow-hidden">
          
          {isAdmin ? (
            <div className="p-5 sm:p-7 space-y-5 sm:space-y-7 overflow-y-auto h-full scrollbar-hide bg-[#F8F9FC] dark:bg-zinc-950">
              <div className="space-y-1.5 mb-2 pt-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Panel</h1>
                <p className="text-[11px] sm:text-[12px] text-primary dark:text-accent font-black uppercase tracking-widest italic opacity-80">Management Hub v2.5</p>
              </div>

              <div className="grid gap-4 sm:gap-5 pb-12">
                <Link href="/orders-feed" className="block w-full">
                  <Card className="hover:scale-[1.02] active:scale-95 transition-all border-none shadow-xl bg-emerald-600 dark:bg-emerald-800 text-white overflow-hidden h-32 sm:h-36 flex items-center cursor-pointer relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-6 sm:p-7 flex flex-row items-center gap-5 sm:gap-6 w-full space-y-0">
                      <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                        <LayoutGrid className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Live Tracker</CardTitle>
                        <CardDescription className="text-emerald-50 text-[10px] font-black opacity-80 uppercase tracking-widest mt-1.5">Approve & Reject Orders</CardDescription>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/broadcast" className="block w-full">
                  <Card className="hover:scale-[1.02] active:scale-95 transition-all border-none shadow-xl bg-primary dark:bg-primary/80 text-white overflow-hidden h-32 sm:h-36 flex items-center cursor-pointer relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-6 sm:p-7 flex flex-row items-center gap-5 sm:gap-6 w-full space-y-0">
                      <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                        <Megaphone className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Broadcast Msg</CardTitle>
                        <CardDescription className="text-blue-50 text-[10px] font-black opacity-80 uppercase tracking-widest mt-1.5">Real-time Announcements</CardDescription>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/dashboard/users" className="block w-full">
                  <Card className="hover:scale-[1.02] active:scale-95 transition-all border-none shadow-xl bg-zinc-800 dark:bg-zinc-900 text-white overflow-hidden h-32 sm:h-36 flex items-center border dark:border-zinc-700 cursor-pointer relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-6 sm:p-7 flex flex-row items-center gap-5 sm:gap-6 w-full space-y-0">
                      <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">All Users</CardTitle>
                        <CardDescription className="text-zinc-300 text-[10px] font-black opacity-80 uppercase tracking-widest mt-1.5">Database & Contact List</CardDescription>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F0F2F5] dark:bg-zinc-950">
              {/* USER ACTION BAR */}
              {user && (
                <div className="h-11 sm:h-12 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center px-5 justify-between shrink-0 shadow-sm z-10">
                  <span className="text-[10px] sm:text-[11px] font-black text-primary dark:text-accent uppercase tracking-[0.25em] italic">Automated Assistant</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 gap-2 text-[10px] sm:text-[11px] font-black hover:bg-primary/5 text-primary dark:text-accent uppercase tracking-wider">
                        <History className="w-4 h-4" /> Recent Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-[2.5rem] dark:bg-zinc-950 border-none shadow-2xl p-7">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2.5 dark:text-zinc-50 text-lg font-black uppercase tracking-tighter">
                          <History className="w-6 h-6 text-primary" />
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
      <footer className="h-14 bg-white dark:bg-zinc-950 border-t dark:border-zinc-900 flex items-center justify-center shrink-0 z-[100] pb-[calc(env(safe-area-inset-bottom,12px)+8px)]">
        <p className="text-[8px] sm:text-[9px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-[0.6em] opacity-40">
          InstaFlow Engine v2.5 • Official Automation
        </p>
      </footer>
    </div>
  );
}

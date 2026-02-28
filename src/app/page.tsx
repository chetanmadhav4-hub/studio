'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { CheckCircle2, Zap, MessageSquare, History, Moon, Sun, LayoutGrid } from "lucide-react";
import { useUser } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [isDark, setIsDark] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

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
      <header className="border-b bg-white dark:bg-card sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">InstaFlow</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!isUserLoading && (
              <>
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-sm">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-2 text-sm dark:text-foreground hover:bg-accent"
                      onClick={toggleTheme}
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-primary" />}
                    </Button>

                    {/* ONLY SHOW TRACKER BUTTON TO ADMIN */}
                    {user.email === ADMIN_EMAIL && (
                      <Link href="/orders-feed">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 h-8 gap-1.5 shadow-sm rounded-lg transition-all active:scale-95">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          LIVE TRACKER
                        </Button>
                      </Link>
                    )}

                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 text-sm dark:text-foreground p-1">
                        <Avatar className="w-7 h-7 border">
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

      <section className="bg-gradient-to-b from-white to-background dark:from-card dark:to-background pt-8 pb-12 md:pt-16 md:pb-20 transition-colors">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Welcome to <span className="text-primary">InstaFlow</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of users who grow their social media presence automatically.
              </p>
            </div>

            {user ? (
              <div className="flex justify-center flex-col items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 shadow-sm border-primary/20 text-primary hover:text-primary hover:bg-primary/5 dark:bg-card dark:text-foreground text-xs h-9">
                      <History className="w-4 h-4" />
                      View Order History
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Instant Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                24/7 Automation
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 border-t bg-white dark:bg-card transition-colors">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-base tracking-tight text-primary">InstaFlow Bot</span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            © 2024 InstaFlow Automation
          </p>
        </div>
      </footer>
    </div>
  );
}


'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { OrderHistory } from "@/components/order-history";
import { CheckCircle2, Zap, ShieldCheck, MessageSquare, History, Moon, Sun } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
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

  // Initialize theme from localStorage
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
      {/* Header */}
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

                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2 text-sm dark:text-foreground">
                        <Avatar className="w-6 h-6 border">
                          <AvatarFallback className="text-[10px] bg-primary text-white">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden xs:inline">Profile</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-background dark:from-card dark:to-background pt-12 pb-16 md:pt-20 md:pb-24 transition-colors">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Welcome to <span className="text-primary">InstaFlow</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                Join thousands of users who grow their social media presence automatically. Secure login, instant payments, and 24/7 delivery.
              </p>
            </div>

            {user ? (
              <div className="flex justify-center flex-col items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 shadow-sm border-primary/20 text-primary hover:text-primary hover:bg-primary/5 dark:bg-card dark:text-foreground">
                      <History className="w-4 h-4" />
                      View Order History
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-md max-h-[85vh] overflow-y-auto">
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

            {/* Chat Interaction Area */}
            <div className="w-full max-w-[420px] mx-auto mt-4 transition-all">
              <BotPreview />
            </div>

            <div className="hidden sm:flex items-center justify-center gap-8 pt-8 opacity-60">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Instant Activation
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                24/7 Automation
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Secure Payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-card transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Automation, Simple Interface
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Everything you need to scale your SMM business without manual intervention.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 dark:bg-background/20 hover:border-primary/50 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Priority Support</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Best-in-class support team available round the clock to solve your queries instantly via WhatsApp.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 dark:bg-background/20 hover:border-primary/50 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Access</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Your credentials and orders are protected with bank-grade encryption and secure authentication.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 dark:bg-background/20 hover:border-primary/50 transition-all space-y-4 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Fulfillment</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Orders are processed automatically the moment payment is confirmed for lightning-fast results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 md:py-12 border-t bg-white dark:bg-card transition-colors">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight text-primary">InstaFlow Bot</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2024 InstaFlow Automation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

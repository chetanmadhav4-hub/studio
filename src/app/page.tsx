'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { CheckCircle2, Zap, ShieldCheck, MessageSquare, LogOut, MessageCircle } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xs:inline">Logout</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-background pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Welcome to <span className="text-primary">InstaFlow</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join thousands of users who grow their social media presence automatically. Secure login, instant payments, and 24/7 delivery.
              </p>
              
              {!isUserLoading && !user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg bg-primary">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg border-primary text-primary">
                      Login to Portal
                    </Button>
                  </Link>
                </div>
              ) : user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <div className="px-5 py-3 bg-primary/10 text-primary rounded-xl border border-primary/20 flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold text-sm md:text-base text-center">Bot is active for you! Interact below.</span>
                  </div>
                </div>
              ) : null}

              <div className="hidden sm:flex items-center justify-center lg:justify-start gap-6 pt-4">
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
            <div className="flex-1 w-full max-w-[400px] lg:max-w-md order-1 lg:order-2">
              <BotPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-white">
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
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">WhatsApp Bot</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Connect your business number and automate orders directly via chat.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Access</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Your credentials and orders are protected with bank-grade encryption.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Fulfillment</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Orders are processed the moment payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 md:py-12 border-t bg-white">
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
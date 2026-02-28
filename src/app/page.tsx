
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { CheckCircle2, Zap, ShieldCheck, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">InstaFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-background pt-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Welcome to <span className="text-primary">InstaFlow</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join thousands of users who grow their social media presence automatically. Secure login, instant payments, and 24/7 delivery.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 text-lg bg-primary">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-primary text-primary">
                    Login to Portal
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
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
            <div className="flex-1 w-full max-w-md">
              <BotPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Automation, Simple Interface
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to scale your SMM business without manual intervention.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">WhatsApp Bot</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your business number and automate orders directly via chat.
              </p>
            </div>
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Access</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your credentials and orders are protected with bank-grade encryption.
              </p>
            </div>
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Fulfillment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Orders are processed the moment payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-12 border-t bg-white">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight text-primary">InstaFlow Bot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 InstaFlow Automation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

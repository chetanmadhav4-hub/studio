import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotPreview } from "@/components/bot-preview";
import { CheckCircle2, MessageSquare, Zap, ShieldCheck } from "lucide-react";

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
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <Link href="/dashboard">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-background pt-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Automate Your SMM Orders via <span className="text-primary">WhatsApp</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                The fastest way for your customers to buy Instagram followers. Automated flow, dynamic payments, and instant SMM panel integration.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="h-12 px-8 text-lg bg-primary">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-primary text-primary">
                  View Demo Bot
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Instant Setup
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
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <BotPreview />
              </div>
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
              We've built everything you need to scale your SMM business without manual intervention.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">WhatsApp Chatbot</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamlessly guide users from service selection to payment with our intuitive conversation flow.
              </p>
            </div>
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dynamic payment link generation with automatic webhook confirmation and status tracking.
              </p>
            </div>
            <div className="p-8 rounded-2xl border bg-background/50 hover:border-primary/50 transition-all space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Fulfillment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically place orders on your favorite SMM panels the moment payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
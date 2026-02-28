
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy, CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SimpleOrdersFeed() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Use collectionGroup to fetch ALL orders from all users
  const ordersQuery = useMemoFirebase(() => {
    return query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "UTR ID has been copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-background">
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground">Orders dekhne ke liye kripya pehle Login karein.</p>
        <Link href="/login">
          <Button className="bg-primary text-white">Login Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-6 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Live Orders</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">InstaFlow Tracker</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:bg-slate-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-slate-500">Naye orders check ho rahe hain...</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-md overflow-hidden rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-50 p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">SERVICE</p>
                      <h3 className="text-sm font-extrabold text-primary leading-tight">{order.serviceName}</h3>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none text-[10px] font-bold px-2 py-0.5">
                      QTY: {order.quantity?.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* UTR Section */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">UTR ID</p>
                      <p className="font-mono text-xs font-bold text-slate-800 truncate">{order.utrId || 'PENDING'}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:bg-primary/5 shrink-0"
                      onClick={() => handleCopy(order.utrId || '', order.id)}
                    >
                      {copiedId === order.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Link Section */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">INSTAGRAM LINK</p>
                    <p className="text-[11px] text-blue-600 font-medium break-all line-clamp-2 leading-relaxed">{order.targetLink}</p>
                    <Button 
                      asChild 
                      className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-xs font-bold gap-2 shadow-sm rounded-lg"
                    >
                      <a href={order.targetLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Link
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[9px] text-slate-400 font-medium">
                      {order.createdAt?.seconds 
                        ? new Date(order.createdAt.seconds * 1000).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
                        : 'Just now'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300">ID: {order.id.slice(-6).toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center space-y-4 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Abhi tak koi order nahi mila hai.</p>
          </div>
        )}
      </div>

      {/* Persistent Info Tip */}
      <div className="fixed bottom-6 left-4 right-4 bg-slate-900 text-white p-3 rounded-2xl text-center text-[10px] font-bold shadow-2xl opacity-95 flex items-center justify-center gap-2">
        🚀 Har 5-10 minute mein refresh karte rahein!
      </div>
    </div>
  );
}

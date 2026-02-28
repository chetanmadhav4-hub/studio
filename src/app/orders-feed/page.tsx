
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy, CheckCircle2, ShoppingBag, RefreshCcw, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SimpleOrdersFeed() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  // QUERY THE GLOBAL MASTER COLLECTION
  const ordersQuery = useMemoFirebase(() => {
    return query(collection(db, 'all_orders'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: orders, isLoading, error } = useCollection(ordersQuery);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "UTR ID has been copied." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ONLY ADMIN EMAIL CAN ACCESS
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center gap-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Ye page sirf Admin (chetanmadhav4@gmail.com) ke liye hai.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold">
            Login as Admin
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Live Tracker</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Master Feed</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.location.reload()} className="rounded-full">
            <RefreshCcw className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-slate-500">Loading master records...</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-md rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b p-4 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">SERVICE</p>
                      <h3 className="text-sm font-extrabold text-primary">{order.serviceName}</h3>
                    </div>
                    <Badge variant="secondary" className="font-bold text-[10px]">
                      QTY: {order.quantity?.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">UTR ID</p>
                      <p className="font-mono text-xs font-bold text-slate-800">{order.utrId || 'PENDING'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(order.utrId || '', order.id)}>
                      {copiedId === order.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">INSTAGRAM LINK</p>
                    <p className="text-[11px] text-blue-600 font-medium break-all line-clamp-2">{order.targetLink}</p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-xs font-bold gap-2">
                      <a href={order.targetLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> Open Profile
                      </a>
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded uppercase">{order.id.slice(-6)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center space-y-4 border shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Abhi koi order nahi hai.</p>
          </div>
        )}
      </div>
      <div className="fixed bottom-6 left-4 right-4 bg-slate-900 text-white p-3 rounded-2xl text-center text-[10px] font-bold shadow-2xl opacity-90 border border-white/10">
        🚀 MASTER TRACKER - Logged in as Admin
      </div>
    </div>
  );
}

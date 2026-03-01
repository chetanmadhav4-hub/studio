
"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  ShoppingBag, 
  RefreshCcw, 
  Lock, 
  Check, 
  XCircle, 
  Clock,
  User as UserIcon,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SimpleOrdersFeed() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, 'all_orders'), orderBy('createdAt', 'desc'), limit(100));
  }, [db, user?.email]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const pendingOrders = orders?.filter(o => o.status === 'PROCESSING' || !o.status) || [];
  const completedOrders = orders?.filter(o => o.status === 'COMPLETED' || o.status === 'REJECTED') || [];

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "UTR ID copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = async (order: any, action: 'APPROVE' | 'REJECT') => {
    if (!order.id || processingId) return;
    setProcessingId(order.id);

    try {
      const newStatus = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';
      
      const orderRef = doc(db, 'all_orders', order.id);
      await updateDoc(orderRef, { status: newStatus });

      const targetSessionId = order.phoneNumber; 
      if (targetSessionId) {
        const sessionRef = doc(db, 'botSessions', targetSessionId);
        const shortId = order.id.slice(-6);
        const msg = action === 'APPROVE' 
          ? `✅ *ORDER APPROVED:* Order #${shortId} approve ho gaya hai! Kaam jaldi shuru ho jayega. 🚀`
          : `❌ *ORDER REJECTED:* Order #${shortId} reject kar diya gaya hai. ⚠️ Reason: Invalid Link ya Galat UTR ID.`;

        await updateDoc(sessionRef, { 
          notifications: arrayUnion({
            id: Math.random().toString(36).slice(2, 9),
            message: msg,
            createdAt: Date.now()
          }),
          lastNotificationAt: serverTimestamp() 
        });
      }

      toast({
        title: action === 'APPROVE' ? "Order Approved!" : "Order Rejected",
        description: "Status successfully updated.",
      });
    } catch (e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Action failed." });
    } finally {
      setProcessingId(null);
    }
  };

  if (isUserLoading) return <div className="h-[100dvh] flex items-center justify-center bg-background dark:bg-zinc-950"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-background dark:bg-zinc-950 p-4 text-center gap-6">
        <Lock className="w-16 h-16 text-red-500 animate-bounce" />
        <div className="space-y-2">
          <h2 className="text-3xl font-black dark:text-zinc-50 uppercase tracking-tighter">Access Denied</h2>
          <p className="text-sm text-muted-foreground font-bold">This area is for authorized administrators only.</p>
        </div>
        <Link href="/login"><Button className="px-10 h-12 font-black uppercase rounded-2xl">Login as Admin</Button></Link>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#F0F2F5] dark:bg-zinc-950 flex flex-col overflow-hidden transition-colors font-body">
      {/* HEADER */}
      <div className="pt-[calc(env(safe-area-inset-top,24px)+8px)] pb-4 px-4 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 shadow-sm z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                <ArrowLeft className="w-5 h-5 dark:text-zinc-50" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-black dark:text-zinc-50 uppercase tracking-tighter leading-none">Live Tracker</h1>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Real-time Stream</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.location.reload()}>
            <RefreshCcw className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* SCROLLABLE FEED */}
      <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar p-4 pb-32 h-full">
        <div className="max-w-md mx-auto space-y-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-zinc-900 rounded-3xl p-1.5 border dark:border-zinc-800 h-14 shadow-lg sticky top-0 z-40">
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] sm:text-xs gap-2 rounded-2xl transition-all">
                <Clock className="w-4 h-4" /> Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xl font-black text-[10px] sm:text-xs gap-2 rounded-2xl transition-all">
                <CheckCircle2 className="w-4 h-4" /> History ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Orders...</p>
                </div>
              ) : pendingOrders.length > 0 ? (
                pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onCopy={handleCopy} onAction={handleAction} copiedId={copiedId} isProcessing={processingId === order.id} showActions={true} />
                ))
              ) : (
                <div className="py-24 text-center space-y-4 bg-white/50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-zinc-800">
                  <ShoppingBag className="w-12 h-12 text-slate-200 dark:text-zinc-800 mx-auto" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No orders waiting approval.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {completedOrders.length > 0 ? (
                 completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onCopy={handleCopy} copiedId={copiedId} showActions={false} />
                ))
               ) : (
                 <div className="py-24 text-center space-y-4 bg-white/50 dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-zinc-800">
                  <ShoppingBag className="w-12 h-12 text-slate-200 dark:text-zinc-800 mx-auto" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No history records found.</p>
                </div>
               )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="h-14 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 flex items-center justify-center shrink-0 pb-[calc(env(safe-area-inset-bottom,12px)+2px)]">
        <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-[0.4em] opacity-50">
          instaflow create by chetan nagani
        </p>
      </div>
    </div>
  );
}

function OrderCard({ order, onCopy, onAction, copiedId, isProcessing, showActions }: any) {
  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-zinc-900 overflow-hidden transition-all hover:scale-[1.01]">
      <CardHeader className="border-b dark:border-zinc-800 p-6 bg-slate-50/50 dark:bg-zinc-800/20 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <p className="text-[9px] text-primary dark:text-accent font-black uppercase tracking-[0.2em]">Service</p>
          <h3 className="text-base font-black text-slate-900 dark:text-zinc-50">{order.serviceName}</h3>
        </div>
        <div className="flex flex-col items-end">
           <Badge variant="secondary" className="font-black text-[10px] h-7 px-3 bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent rounded-xl">
            {order.quantity?.toLocaleString()}
          </Badge>
          <p className="text-[10px] font-black text-emerald-600 mt-1">₹{order.price}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border dark:border-zinc-800">
          <UserIcon className="w-4 h-4 text-primary dark:text-accent" />
          <span className="text-xs font-black dark:text-zinc-200">+{order.phoneNumber}</span>
          <Badge variant="outline" className="ml-auto text-[8px] font-black uppercase tracking-widest border-slate-200 dark:border-zinc-700 dark:text-zinc-400">ID: {order.id.slice(-6)}</Badge>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-3xl border dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Payment UTR ID</p>
            <p className="font-mono text-xs sm:text-sm font-black dark:text-zinc-50 tracking-wider">{order.utrId || 'PENDING'}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl bg-white dark:bg-zinc-800 shadow-sm" onClick={() => onCopy(order.utrId || '', order.id)}>
            {copiedId === order.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </Button>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-3xl border dark:border-zinc-800 space-y-3">
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Target Instagram Link</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-blue-600 dark:text-accent font-bold break-all line-clamp-1 flex-1">{order.targetLink}</p>
            <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-xl shrink-0 dark:border-zinc-700">
              <a href={order.targetLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
            </Button>
          </div>
          <Button asChild className="w-full h-10 text-[9px] font-black uppercase tracking-widest gap-2 dark:bg-accent dark:text-zinc-950 rounded-2xl shadow-lg">
            <a href={order.targetLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /> Open Instagram Post</a>
          </Button>
        </div>

        {showActions ? (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button onClick={() => onAction(order, 'REJECT')} disabled={isProcessing} variant="outline" className="h-12 text-[10px] font-black uppercase tracking-widest gap-2 text-red-500 border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-50">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button onClick={() => onAction(order, 'APPROVE')} disabled={isProcessing} className="h-12 text-[10px] font-black uppercase tracking-widest gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-500/20">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
            </Button>
          </div>
        ) : (
          <div className={`w-full h-12 flex items-center justify-center rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-sm border ${
            order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
          }`}>
            {order.status === 'COMPLETED' ? 'Order Success ✓' : 'Order Rejected ✗'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

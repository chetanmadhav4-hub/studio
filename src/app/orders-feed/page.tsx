
'use client';

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
  User as UserIcon
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { sendAdminActionNotification } from "@/app/actions/whatsapp-actions";

export default function SimpleOrdersFeed() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  // FIX: Only initiate query if user is admin to avoid permission errors
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, 'all_orders'), orderBy('createdAt', 'desc'), limit(100));
  }, [db, user]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const pendingOrders = orders?.filter(o => o.status === 'PROCESSING' || !o.status) || [];
  const completedOrders = orders?.filter(o => o.status === 'COMPLETED' || o.status === 'REJECTED') || [];

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "UTR ID has been copied." });
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
      if (!targetSessionId) throw new Error("Target session ID missing on order.");
      
      const sessionRef = doc(db, 'botSessions', targetSessionId);
      const shortId = order.id.slice(-6);

      const notificationId = Math.random().toString(36).slice(2, 9);
      let msg = '';

      if (action === 'APPROVE') {
        msg = `✅ *ORDER APPROVED:* Order #${shortId} approve ho gaya hai! Kaam jaldi shuru ho jayega. 🚀`;
        if (targetSessionId.length > 10) {
          sendAdminActionNotification(targetSessionId, msg);
        }
      } else {
        msg = `❌ *ORDER REJECTED:* Order #${shortId} reject kar diya gaya hai. ⚠️ Reason: Invalid Link ya Galat UTR ID.`;
      }

      await updateDoc(sessionRef, { 
        notifications: arrayUnion({
          id: notificationId,
          message: msg,
          createdAt: Date.now()
        }),
        lastNotificationAt: serverTimestamp() 
      });

      toast({
        title: action === 'APPROVE' ? "Order Approved!" : "Order Rejected",
        description: action === 'APPROVE' ? "User notified via WhatsApp & Bell." : "Status sent to user's Bell notifications.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Action failed. Check console.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-zinc-950 p-4 text-center gap-6">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Access Restricted</h2>
          <p className="text-muted-foreground dark:text-zinc-400 max-w-xs mx-auto">
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
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-zinc-950 p-4 pb-20 transition-colors">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Admin Control</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Order Management</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.location.reload()} className="rounded-full dark:text-zinc-400">
            <RefreshCcw className="w-5 h-5" />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-white dark:bg-zinc-900 p-1 shadow-sm border dark:border-zinc-800">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs gap-2 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs gap-2 dark:text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              History ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : pendingOrders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center space-y-3 border dark:border-zinc-800 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-100 dark:text-emerald-950/30 mx-auto" />
                <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">Koi pending order nahi hai!</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onCopy={handleCopy} 
                  onAction={handleAction} 
                  copiedId={copiedId} 
                  isProcessing={processingId === order.id}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : completedOrders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center space-y-3 border dark:border-zinc-800 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-slate-100 dark:text-zinc-800 mx-auto" />
                <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">History khali hai.</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onCopy={handleCopy} 
                  copiedId={copiedId} 
                  showActions={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({ order, onCopy, onAction, copiedId, isProcessing, showActions }: any) {
  return (
    <Card className="border-none shadow-md rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden transition-all">
      <CardHeader className="border-b dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-zinc-800/20 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5 text-left">
          <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase">SERVICE</p>
          <h3 className="text-sm font-extrabold text-primary dark:text-accent">{order.serviceName}</h3>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase">QUANTITY</p>
          <Badge variant="secondary" className="font-bold text-[10px] bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent border-none">
            {order.quantity?.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1 p-2 bg-slate-50 dark:bg-zinc-800/40 rounded-lg border border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 bg-primary/10 dark:bg-accent/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary dark:text-accent" />
          </div>
          <div className="flex flex-col text-left">
            <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase leading-none">Ordered By</p>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {order.phoneNumber?.length > 15 ? `UID: ${order.phoneNumber.slice(0,8)}...` : `+${order.phoneNumber}`}
            </span>
          </div>
          <Badge variant="outline" className="ml-auto text-[9px] font-mono border-slate-200 dark:border-zinc-700 text-slate-400">
            ID: {order.id.slice(-6)}
          </Badge>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase mb-1">UTR ID</p>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-wider">{order.utrId || 'PENDING'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onCopy(order.utrId || '', order.id)} className="h-8 w-8 dark:text-zinc-400">
            {copiedId === order.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 text-left">
          <p className="text-[9px] text-muted-foreground dark:text-zinc-500 font-bold uppercase">INSTAGRAM LINK</p>
          <p className="text-[11px] text-blue-600 dark:text-accent font-medium break-all line-clamp-1">{order.targetLink}</p>
          <Button asChild variant="outline" className="w-full h-8 text-xs font-bold gap-2 border-blue-200 dark:border-accent/20 text-blue-600 dark:text-accent hover:bg-blue-50 dark:hover:bg-accent/5">
            <a href={order.targetLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" /> Open Post/Profile
            </a>
          </Button>
        </div>

        {showActions ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              onClick={() => onAction(order, 'REJECT')} 
              disabled={isProcessing}
              variant="outline" 
              className="h-10 text-xs font-bold gap-2 text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button 
              onClick={() => onAction(order, 'APPROVE')} 
              disabled={isProcessing}
              className="h-10 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </Button>
          </div>
        ) : (
          <div className="pt-2">
            <Badge className={`w-full h-9 flex items-center justify-center rounded-xl font-bold uppercase tracking-wider text-[10px] ${
              order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
            }`}>
              {order.status === 'COMPLETED' ? 'SUCCESSFULLY COMPLETED' : 'ORDER REJECTED'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Save, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function BroadcastAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';
  
  const broadcastRef = useMemoFirebase(() => doc(db, 'settings', 'broadcast'), [db]);
  const { data: broadcastData, isLoading } = useDoc(broadcastRef);

  useEffect(() => {
    if (broadcastData) {
      setMessage(broadcastData.broadcastMessage || '');
      setIsActive(broadcastData.isBroadcastActive || false);
    }
  }, [broadcastData]);

  const handleSave = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    if (!message.trim() && isActive) {
      toast({ variant: "destructive", title: "Wait!", description: "Message can't be empty if broadcast is active." });
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(broadcastRef, {
        broadcastMessage: message,
        isBroadcastActive: isActive,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: "Broadcast Updated",
        description: "Your message is now live for all users instantly!",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update broadcast settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only super admin can manage broadcasts.</p>
        <Link href="/"><Button variant="outline">Back Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Broadcast Manager</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70">Real-time Global Announcements</p>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden rounded-[2rem] bg-white">
        <CardHeader className="bg-primary text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Live Broadcast</CardTitle>
                <CardDescription className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Connected to all user sessions</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 shadow-inner">
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-emerald-500"
              />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isActive ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Message Content</Label>
            <Textarea 
              placeholder="Ex: 🚀 20% Extra Followers on all orders today! Offer valid till midnight."
              className="min-h-[180px] text-base resize-none focus:ring-primary border-slate-200 rounded-2xl p-4 font-medium"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic font-bold">
              <Zap className="w-3 h-3 text-amber-500" />
              Real-time update: Users will see this as soon as you save.
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</p>
            {isActive ? (
              <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex items-start gap-4 shadow-sm animate-pulse">
                <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                {/* FIXED: added whitespace-pre-wrap to preserve line-by-line formatting in preview */}
                <p className="text-sm text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">
                  {message || 'Type something to preview...'}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center border rounded-2xl bg-white border-slate-100">
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest italic">Broadcast is currently disabled.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-6 flex justify-between items-center">
           <Link href="/"><Button variant="ghost" className="text-xs font-bold uppercase tracking-widest">Cancel</Button></Link>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            className="gap-2 px-10 h-12 font-black uppercase tracking-wider rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Publish Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

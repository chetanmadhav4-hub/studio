
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BroadcastAdminPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';
  
  const broadcastRef = doc(db, 'settings', 'broadcast');
  const { data: broadcastData, isLoading } = useDoc(broadcastRef);

  useEffect(() => {
    if (broadcastData) {
      setMessage(broadcastData.broadcastMessage || '');
      setIsActive(broadcastData.isBroadcastActive || false);
    }
  }, [broadcastData]);

  const handleSave = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    setIsSaving(true);
    try {
      await setDoc(broadcastRef, {
        broadcastMessage: message,
        isBroadcastActive: isActive,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: "Broadcast Updated",
        description: "Your message is now live for all users.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update broadcast.",
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
        <p className="text-muted-foreground">This page is for super admin only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Broadcast Manager</h2>
        <p className="text-sm text-slate-500">Send real-time announcements to all logged-in users.</p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
        <CardHeader className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg">Broadcast Settings</CardTitle>
                <CardDescription className="text-blue-100 text-xs">Real-time update across all user devices</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-emerald-500"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Broadcast Message</Label>
            <Textarea 
              placeholder="Ex: 🚀 20% Extra Followers on all orders today! Offer valid till midnight."
              className="min-h-[150px] text-sm resize-none focus:ring-primary border-slate-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Formatting like *bold* is not supported here, use emojis for emphasis.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</p>
            {isActive ? (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  {message || 'No message set...'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">Broadcast is currently disabled.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            className="gap-2 px-8 font-bold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Broadcast
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

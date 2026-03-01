
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, LogOut, ShieldEllipsis, MessageSquare, ScrollText, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }

    if (user) {
      const fetchUsername = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().username);
        }
      };
      fetchUsername();
    }
  }, [user, isUserLoading, db, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update password. Check your current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 pt-[calc(env(safe-area-inset-top,24px)+24px)] pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2 dark:text-zinc-50 font-bold uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-black text-xl text-primary uppercase italic">InstaFlow</span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="bg-primary/5 dark:bg-primary/10">
            <CardTitle className="font-black uppercase tracking-tight dark:text-zinc-50">My Profile</CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest opacity-70">Account Settings & Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700">
                <Label className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Username</Label>
                <p className="font-black text-lg text-primary dark:text-accent">@{username}</p>
              </div>
              <div className="space-y-1 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border dark:border-zinc-700">
                <Label className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Email Address</Label>
                <p className="font-black text-sm text-slate-700 dark:text-zinc-200 truncate">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2rem] bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="bg-primary/5 dark:bg-primary/10">
            <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tight dark:text-zinc-50 text-base">
              <ShieldEllipsis className="w-5 h-5 text-primary" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4 p-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1" htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  required 
                  className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl font-bold dark:text-zinc-50"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1" htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  required 
                  className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl font-bold dark:text-zinc-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1" htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  required 
                  className="h-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl font-bold dark:text-zinc-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button type="submit" disabled={loading} className="w-full h-12 font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border-none shadow-xl hover:scale-[1.02] transition-transform cursor-pointer rounded-3xl bg-white dark:bg-zinc-900">
                <CardHeader className="p-6">
                  <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tight dark:text-zinc-50">
                    <ScrollText className="w-4 h-4 text-primary" />
                    Policies
                  </CardTitle>
                  <CardDescription className="text-[9px] font-black uppercase tracking-widest">Usage Terms</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-md h-[80vh] overflow-y-auto rounded-[2.5rem] dark:bg-zinc-950 border-none p-8">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-tighter text-xl">Terms & Conditions</DialogTitle>
                <DialogDescription className="font-bold text-xs uppercase tracking-widest">InstaFlow Official Guidelines</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 text-sm text-foreground/80 py-6">
                <section className="space-y-2">
                  <h4 className="font-black text-primary uppercase text-xs tracking-wider">1. Service Usage</h4>
                  <p className="font-medium leading-relaxed dark:text-zinc-300">InstaFlow is an automation tool for social media services. We are not affiliated with Instagram or any social media platform.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-primary uppercase text-xs tracking-wider">2. Account Safety</h4>
                  <p className="font-medium leading-relaxed dark:text-zinc-300">We do not ask for your Instagram password. You should only provide profile or post links. Ensure your account is PUBLIC before ordering.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-primary uppercase text-xs tracking-wider">3. Refund Policy</h4>
                  <p className="font-medium leading-relaxed dark:text-zinc-300">Once an order is placed and the payment is confirmed, no refunds will be processed as the order is instantly sent to the SMM panel.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-primary uppercase text-xs tracking-wider">4. Delivery Time</h4>
                  <p className="font-medium leading-relaxed dark:text-zinc-300">Estimated start times (0-30 mins) are indicative. Some services may take up to 24 hours depending on the server load.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-black text-primary uppercase text-xs tracking-wider">5. Payments</h4>
                  <p className="font-medium leading-relaxed dark:text-zinc-300">All payments must be made to the official UPI ID mentioned in the bot. Screenshots must be provided for manual verification if required.</p>
                </section>
              </div>
            </DialogContent>
          </Dialog>

          <a 
            href="https://wa.me/919116399517?text=Hi, I need support with InstaFlow Bot." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Card className="border-none shadow-xl hover:scale-[1.02] transition-transform cursor-pointer rounded-3xl bg-[#25D366] text-white">
              <CardHeader className="p-6">
                <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-tight">
                  <MessageSquare className="w-4 h-4" />
                  Live Help
                </CardTitle>
                <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/80">Contact via WhatsApp</CardDescription>
              </CardHeader>
            </Card>
          </a>
        </div>

        <Button 
          variant="destructive" 
          className="w-full h-14 gap-2 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-red-500/20 mb-8" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout Account
        </Button>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] pt-4 opacity-50">
          instaflow create by chetan nagani
        </p>
      </div>
    </div>
  );
}

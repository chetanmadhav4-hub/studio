
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, Instagram, KeyRound, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Details Missing",
        description: "Please enter your username/email and password.",
      });
      return;
    }
    
    setLoading(true);

    try {
      let loginEmail = id;

      if (!id.includes('@')) {
        const usernameRef = doc(db, 'usernames', id.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        
        if (!usernameSnap.exists()) {
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Not Found",
            description: "Username not registered. Please use your email.",
          });
          return;
        }
        
        const data = usernameSnap.data();
        if (!data || !data.email) {
          throw new Error('Email mapping missing.');
        }
        loginEmail = data.email;
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);

      toast({
        title: "Welcome Back!",
        description: "Login successful.",
      });
      
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast({ variant: "destructive", title: "Wait!", description: "Please enter your registered email." });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Reset Link Sent!",
        description: "Check your email inbox/spam to reset your password.",
      });
      setResetEmail('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-background dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-background dark:bg-zinc-950 p-4 sm:p-6 transition-colors duration-300 overflow-hidden relative">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="space-y-2 text-center pt-10 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter dark:text-zinc-50">InstaFlow Access</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-70">Sign in to manage your orders</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-[10px] font-black uppercase tracking-widest ml-1">Username or Email</Label>
              <Input 
                id="identifier" 
                placeholder="Enter details..." 
                required 
                className="h-12 text-sm font-black bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 dark:text-zinc-100"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest">Password</Label>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Forgot?</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl dark:bg-zinc-950">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter dark:text-zinc-50 flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-primary" />
                        Reset Password
                      </DialogTitle>
                      <DialogDescription className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        Enter your email to receive a reset link
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Registered Email</Label>
                        <Input 
                          placeholder="example@gmail.com"
                          className="h-12 bg-slate-100 dark:bg-zinc-800 border-none rounded-2xl font-black"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleForgotPassword} 
                        disabled={resetLoading}
                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl"
                      >
                        {resetLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                        Send Reset Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="h-12 text-sm font-black bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 dark:text-zinc-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-10 px-8">
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Access Dashboard
            </Button>
            <div className="flex flex-col items-center gap-1 mt-2">
              <p className="text-[11px] font-black text-muted-foreground dark:text-zinc-400 uppercase tracking-tight">
                Don't have an account?
              </p>
              <Link href="/signup" className="text-xs text-primary hover:underline font-black uppercase tracking-widest">
                Create Free Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 flex flex-col items-center gap-3 opacity-90 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-[10px] font-black text-slate-900 dark:text-zinc-50 uppercase tracking-[0.4em]">
          instaflow create by chetan nagani
        </p>
        <div className="flex flex-col items-center gap-1.5">
           <Instagram className="w-6 h-6 text-primary dark:text-accent" />
           <p className="text-xs font-black text-primary dark:text-accent uppercase tracking-[0.2em]">
             @bindash_boy3
           </p>
        </div>
      </div>
    </div>
  );
}

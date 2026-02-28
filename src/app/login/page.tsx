
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Details",
        description: "Please enter your username/email and password.",
      });
      return;
    }
    
    setLoading(true);

    try {
      let loginEmail = identifier.trim();

      // 1. If identifier doesn't look like an email, assume it's a username
      if (!loginEmail.includes('@')) {
        const usernameRef = doc(db, 'usernames', loginEmail.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        
        if (!usernameSnap.exists()) {
          throw new Error('Username not found. Please check and try again.');
        }
        loginEmail = usernameSnap.data().email;
      }

      // 2. Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, loginEmail, password);

      toast({
        title: "Logged In Successfully!",
        description: "Welcome back to InstaFlow.",
      });
      
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let message = "Invalid credentials. Please try again.";
      if (error.code === 'auth/invalid-email') message = "The email address is badly formatted.";
      if (error.code === 'auth/user-not-found') message = "Account not found.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-black/5">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your username or email to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input 
                id="identifier" 
                placeholder="johndoe or name@example.com" 
                required 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot Password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full h-11" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Login
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

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
import { Zap, Loader2, LogOut, ShieldEllipsis, MessageSquare, ScrollText, ArrowLeft, LayoutDashboard } from 'lucide-react';
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-primary">InstaFlow</span>
          </div>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and manage your account settings.</CardDescription>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary">
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Username</Label>
                <p className="font-semibold text-lg">@{username}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldEllipsis className="w-5 h-5 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  required 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-primary" />
                    Terms & Conditions
                  </CardTitle>
                  <CardDescription className="text-xs">Review our usage policies.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    By using InstaFlow, you agree to our terms of service regarding SMM panel automation and payments...
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-md h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Terms & Conditions</DialogTitle>
                <DialogDescription>Please read carefully before using our services.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-foreground/80 py-4">
                <section className="space-y-2">
                  <h4 className="font-bold text-primary">1. Service Usage</h4>
                  <p>InstaFlow is an automation tool for social media services. We are not affiliated with Instagram or any social media platform.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-bold text-primary">2. Account Safety</h4>
                  <p>We do not ask for your Instagram password. You should only provide profile or post links. Ensure your account is PUBLIC before ordering.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-bold text-primary">3. Refund Policy</h4>
                  <p>Once an order is placed and the payment is confirmed, no refunds will be processed as the order is instantly sent to the SMM panel.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-bold text-primary">4. Delivery Time</h4>
                  <p>Estimated start times (0-30 mins) are indicative. Some services may take up to 24 hours depending on the server load.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-bold text-primary">5. Payments</h4>
                  <p>All payments must be made to the official UPI ID mentioned in the bot. Screenshots must be provided for manual verification if required.</p>
                </section>
              </div>
            </DialogContent>
          </Dialog>

          <a 
            href="https://wa.me/919116399517?text=Hi, I need support with InstaFlow Bot." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Contact Support
                </CardTitle>
                <CardDescription className="text-xs">Get help from our team via WhatsApp.</CardDescription>
              </CardHeader>
            </Card>
          </a>
        </div>

        <Button 
          variant="destructive" 
          className="w-full h-12 gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout from Account
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          © 2024 InstaFlow Automation. All rights reserved.
        </p>
      </div>
    </div>
  );
}

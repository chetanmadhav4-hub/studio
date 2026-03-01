
'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Calendar, Hash, AlertCircle, KeyRound, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [resettingId, setResettingId] = useState<string | null>(null);
  
  const ADMIN_EMAIL = 'chetanmadhav4@gmail.com';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db, user?.email]);

  const { data: users, isLoading, error } = useCollection(usersQuery);

  const handleSendResetLink = async (email: string, uid: string) => {
    if (resettingId) return;
    setResettingId(uid);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Link Sent!",
        description: `Password reset link has been sent to ${email}.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || "Failed to send reset link.",
      });
    } finally {
      setTimeout(() => setResettingId(null), 2000);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold dark:text-zinc-50">Access Denied</h2>
        <p className="text-muted-foreground dark:text-zinc-300">Only super admin can access this database.</p>
        <Link href="/"><button className="bg-primary text-white px-6 py-2 rounded-xl font-bold">Back Home</button></Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar pb-32">
      <div className="space-y-6 max-w-7xl mx-auto pt-4 px-4 sm:px-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 uppercase">Registered Users</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Complete User Database</p>
        </div>

        <Card className="bg-white dark:bg-zinc-900 shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardTitle className="text-sm font-black flex items-center gap-2 dark:text-zinc-50 uppercase tracking-tight">
              <Hash className="w-4 h-4 text-primary" />
              Total Registered: {users?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading database...</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto overscroll-x-contain touch-pan-x custom-scrollbar">
                <div className="min-w-[1100px] p-4">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-800/50">
                      <TableRow className="border-b dark:border-zinc-800 hover:bg-transparent">
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">USER PROFILE</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">CONTACT INFO</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">SECURITY</TableHead>
                        <TableHead className="font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">USER ID</TableHead>
                        <TableHead className="text-right font-black text-[10px] text-slate-400 dark:text-zinc-400 uppercase tracking-wider">JOINED DATE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users && users.length > 0 ? (
                        users.map((u) => (
                          <TableRow key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors border-b dark:border-zinc-800">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border dark:border-zinc-700 shadow-sm">
                                  <AvatarFallback className="bg-primary/10 text-primary dark:text-accent text-xs font-black uppercase">
                                    {u.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-black text-sm text-slate-900 dark:text-zinc-50">@{u.username}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-zinc-400 font-black uppercase tracking-tighter opacity-70">Active User</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full w-fit border dark:border-zinc-700 uppercase tracking-tight">
                                <Mail className="w-3 h-3 text-primary/60" />
                                {u.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl dark:border-zinc-700 dark:text-zinc-50 hover:bg-primary/10 transition-colors"
                                onClick={() => handleSendResetLink(u.email, u.id)}
                                disabled={resettingId === u.id}
                              >
                                {resettingId === u.id ? <Check className="w-3 h-3 text-emerald-500" /> : <KeyRound className="w-3 h-3" />}
                                Reset User Password
                              </Button>
                            </TableCell>
                            <TableCell>
                                <span className="text-[10px] font-mono font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{u.id}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-black uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                {u.createdAt?.seconds 
                                  ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : 'Recent'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-24 text-slate-400 font-black uppercase tracking-widest italic">
                            No users registered yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

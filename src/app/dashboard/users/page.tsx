'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
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
import { Loader2, User, Mail, Calendar, Hash } from "lucide-react";

export default function AdminUsersPage() {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: users, isLoading } = useCollection(usersQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Registered Users</h2>
        <p className="text-sm text-slate-500">Complete list of users who have signed up on the platform.</p>
      </div>

      <Card className="bg-white shadow-xl border-none rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b bg-white">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Total Registered: {users?.length || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-500">Loading user database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="font-bold text-slate-600">USER PROFILE</TableHead>
                    <TableHead className="font-bold text-slate-600">CONTACT INFO</TableHead>
                    <TableHead className="text-right font-bold text-slate-600">JOINED DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {u.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-900">@{u.username}</span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tighter">UID: {u.id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full w-fit border border-slate-100">
                            <Mail className="w-3.5 h-3.5 text-primary/60" />
                            {u.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 font-medium">
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
                      <TableCell colSpan={3} className="text-center py-24 text-slate-400 font-medium">
                        No users have registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
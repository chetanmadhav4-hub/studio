
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { 
  Bell, 
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserNotification } from "@/lib/bot-types";

export function NotificationBell() {
  const { user } = useUser();
  const db = useFirestore();
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const sessionRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'botSessions', user.uid);
  }, [db, user]);
  
  const { data: session } = useDoc(sessionRef);

  useEffect(() => {
    if (session?.notifications && session.notifications.length > 0) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [session?.notifications]);

  const clearNotifications = async () => {
    if (!sessionRef) return;
    try {
      await updateDoc(sessionRef, { 
        notifications: deleteField() 
      });
      setHasNewNotification(false);
    } catch (e) {
      console.error("Error clearing notifications:", e);
    }
  };

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 rounded-full hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          {hasNewNotification && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl overflow-hidden shadow-2xl border-none mt-2" align="end">
        <div className="bg-primary p-3 text-white flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider">Order Updates</h4>
          {session?.notifications && session.notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] text-white hover:bg-white/10 gap-1 font-bold"
              onClick={clearNotifications}
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </Button>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 max-h-80 overflow-y-auto space-y-3">
          {session?.notifications && session.notifications.length > 0 ? (
            session.notifications.map((notif: UserNotification) => (
              <div 
                key={notif.id}
                className={`p-3 rounded-xl border shadow-sm space-y-2 ${
                  notif.message.includes('REJECTED') 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {notif.message.includes('REJECTED') ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span className={`text-[9px] font-bold uppercase ${
                      notif.message.includes('REJECTED') ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {notif.message.includes('REJECTED') ? 'Action Needed' : 'Order Success'}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                  {notif.message.replace(/\*/g, '')}
                </p>
              </div>
            )).reverse()
          ) : (
            <div className="py-12 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-100 dark:text-zinc-800 mx-auto" />
              <p className="text-xs text-slate-400 font-medium italic">Sabhi clear hai. Koi naya update nahi!</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

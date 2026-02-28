
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Phone, Loader2 } from 'lucide-react';

export default function AdminChatPage() {
  const db = useFirestore();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch all chat sessions (simplified: just getting collection names is hard in SDK, 
  // so we'd typically have a 'sessions' tracking collection. 
  // For now, we list the most recent messages from a global 'chatSessions' or similar.
  // In a real app, you'd have a /chatSessions collection where doc ID is phone number.)
  
  const sessionsQuery = useMemoFirebase(() => {
    return query(collection(db, 'botSessions'), orderBy('updatedAt', 'desc'), limit(50));
  }, [db]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!selectedSession) return null;
    return query(
      collection(db, 'chatSessions', selectedSession, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
  }, [db, selectedSession]);

  const { data: messages, isLoading: messagesLoading } = useCollection(messagesQuery);

  const handleSendReply = async () => {
    if (!selectedSession || !replyText.trim() || isSending) return;
    setIsSending(true);

    try {
      // 1. Log in Firestore
      await addDoc(collection(db, 'chatSessions', selectedSession, 'messages'), {
        text: replyText,
        sender: 'admin',
        timestamp: serverTimestamp(),
      });

      // 2. Ideally trigger a real WhatsApp message here via API
      // For this prototype, we just log it.

      setReplyText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Sidebar - Sessions List */}
      <Card className="w-80 flex flex-col bg-white">
        <CardHeader className="border-b px-4 py-3 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {sessionsLoading ? (
              <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : sessions?.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedSession === session.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {session.id.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">+{session.id}</p>
                    <p className="text-xs text-muted-foreground truncate italic">
                      {session.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedSession ? (
          <>
            <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {selectedSession.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-bold">Chat with +{selectedSession}</CardTitle>
                  <p className="text-xs text-emerald-500 font-medium">Customer Session</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="w-3 h-3" />
                Call User
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
              <ScrollArea className="h-full p-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-[0.9]">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                  ) : messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === 'user' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-white text-foreground rounded-tl-none'
                            : msg.sender === 'admin'
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-emerald-100 text-foreground rounded-tr-none'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right opacity-60 ${msg.sender === 'admin' ? 'text-white' : ''}`}>
                          {msg.timestamp?.seconds 
                            ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="p-4 bg-muted/30 border-t flex gap-3 shrink-0">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder="Type your message to user..."
                className="bg-white"
              />
              <Button onClick={handleSendReply} disabled={isSending} className="gap-2 shrink-0">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 opacity-20" />
            </div>
            <p>Select a session to start chatting with customers</p>
          </div>
        )}
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Users, Mail, Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  sender_name: string;
  recipient_name: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  grade_level: number;
}

export const MessagingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeForm, setComposeForm] = useState({
    recipients: [] as string[],
    subject: '',
    content: '',
    messageType: 'individual' as 'individual' | 'group' | 'broadcast'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchStudents()]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load messaging data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    // Note: This is a simplified implementation. In a real app, you'd have a messages table
    // For now, we'll simulate messages with announcements or notifications
    
    // Fetch students who have assignments from this teacher for mock messages
    const { data: assignments } = await supabase
      .from('lesson_assignments')
      .select(`
        student_id,
        profiles!lesson_assignments_student_id_fkey(full_name, email),
        generated_lessons!inner(title, teacher_id)
      `)
      .eq('generated_lessons.teacher_id', user.id);

    // Create mock messages for demonstration
    const mockMessages: Message[] = [];
    const uniqueStudents = new Map();
    
    assignments?.forEach(assignment => {
      const profile = (assignment as any).profiles;
      if (profile && !uniqueStudents.has(assignment.student_id)) {
        uniqueStudents.set(assignment.student_id, profile);
        
        // Mock a greeting message from each student
        mockMessages.push({
          id: `msg-${assignment.student_id}`,
          sender_id: assignment.student_id,
          recipient_id: user.id,
          subject: 'Hello from your student',
          content: `Hi! I'm excited to be learning with you. Looking forward to the lessons!`,
          is_read: Math.random() > 0.5,
          sent_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          sender_name: profile.full_name || 'Student',
          recipient_name: 'Teacher'
        });
      }
    });

    setMessages(mockMessages);
  };

  const fetchStudents = async () => {
    if (!user) return;

    // Get all students who have assignments from this teacher
    const { data: assignments } = await supabase
      .from('lesson_assignments')
      .select(`
        student_id,
        profiles!lesson_assignments_student_id_fkey(id, full_name, email, grade_level),
        generated_lessons!inner(teacher_id)
      `)
      .eq('generated_lessons.teacher_id', user.id);

    if (!assignments) return;

    const uniqueStudents = new Map<string, Student>();
    assignments.forEach(assignment => {
      const profile = (assignment as any).profiles;
      if (profile && !uniqueStudents.has(assignment.student_id)) {
        uniqueStudents.set(assignment.student_id, {
          id: assignment.student_id,
          full_name: profile.full_name || 'Unknown',
          email: profile.email || '',
          grade_level: profile.grade_level || 0
        });
      }
    });

    setStudents(Array.from(uniqueStudents.values()));
  };

  const sendMessage = async () => {
    if (!composeForm.recipients.length || !composeForm.subject || !composeForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, you would save this to a messages table
    toast({
      title: "Success",
      description: `Message sent to ${composeForm.recipients.length} recipient(s).`,
    });

    // Reset form
    setComposeForm({
      recipients: [],
      subject: '',
      content: '',
      messageType: 'individual'
    });
    setSelectedTab('sent');
  };

  const markAsRead = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, is_read: true } : msg
    ));
  };

  const filteredMessages = messages.filter(message => {
    const matchesTab = selectedTab === 'inbox' 
      ? message.recipient_id === user?.id 
      : message.sender_id === user?.id;
    
    const matchesSearch = searchTerm === '' || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-gray-600">
          Communicate with your students and send announcements
        </p>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold">{messages.filter(m => !m.is_read && m.recipient_id === user?.id).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Connected Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Messages</CardTitle>
                <Button onClick={() => setSelectedTab('compose')}>
                  <Plus size={16} className="mr-2" />
                  Compose
                </Button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-2">
                <Button 
                  variant={selectedTab === 'inbox' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('inbox')}
                  size="sm"
                >
                  Inbox ({messages.filter(m => m.recipient_id === user?.id).length})
                </Button>
                <Button 
                  variant={selectedTab === 'sent' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('sent')}
                  size="sm"
                >
                  Sent ({messages.filter(m => m.sender_id === user?.id).length})
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {selectedTab === 'compose' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Message Type</label>
                    <Select value={composeForm.messageType} onValueChange={(value: 'individual' | 'group' | 'broadcast') => 
                      setComposeForm(prev => ({ ...prev, messageType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Student</SelectItem>
                        <SelectItem value="group">Group Message</SelectItem>
                        <SelectItem value="broadcast">Broadcast to All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {composeForm.messageType !== 'broadcast' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Recipients</label>
                      <Select 
                        value={composeForm.recipients[0] || ''} 
                        onValueChange={(value) => setComposeForm(prev => ({ ...prev, recipients: [value] }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name} (Grade {student.grade_level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Message subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      value={composeForm.content}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Type your message..."
                      rows={6}
                    />
                  </div>

                  <Button onClick={sendMessage} className="w-full">
                    <Send size={16} className="mr-2" />
                    Send Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No messages found.</p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !message.is_read && message.recipient_id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.is_read && message.recipient_id === user?.id) {
                            markAsRead(message.id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {selectedTab === 'inbox' ? message.sender_name : message.recipient_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{message.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.sent_at).toLocaleDateString()}
                            </p>
                            {!message.is_read && message.recipient_id === user?.id && (
                              <Badge variant="default" className="mt-1">New</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail / Students List */}
        <div>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  From: {selectedMessage.sender_name} • {new Date(selectedMessage.sent_at).toLocaleString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">Grade {student.grade_level}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          setComposeForm(prev => ({ 
                            ...prev, 
                            recipients: [student.id],
                            messageType: 'individual'
                          }));
                          setSelectedTab('compose');
                        }}
                      >
                        Send Message
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { TicketStatus, SupportTicket } from '@/lib/types';
import { createSupportTicket, loadSupportTickets, getUserTickets } from '@/lib/support';
import { useAuth } from '@/context/AuthContext';
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface SupportTicketModalProps {
  trigger?: React.ReactNode;
}

const SupportTicketModal = ({ trigger }: SupportTicketModalProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);

  // Load user's tickets when modal opens
  useEffect(() => {
    if (open && user?.id) {
      loadUserTickets();
    }
  }, [open, user]);

  const loadUserTickets = () => {
    if (!user?.id) return;
    
    // Using the correct function name: loadSupportTickets instead of getAllSupportTickets
    const allTickets = loadSupportTickets();
    const userSpecificTickets = allTickets.filter(ticket => ticket.userId === user.id);
    setUserTickets(userSpecificTickets);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to submit a support ticket');
      return;
    }

    const ticket = {
      id: `ticket-${Date.now()}`,
      userId: user.id || '',
      username: user.username || 'Anonymous',
      subject: data.subject,
      message: data.message,
      createdAt: Date.now(),
      status: 'open' as TicketStatus,
    };

    createSupportTicket(ticket);
    
    toast.success('Support ticket submitted successfully');
    form.reset();
    loadUserTickets(); // Reload tickets after submitting
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Contact Support</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Submit a ticket and our team will get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide details about your issue"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Submit Ticket</Button>
            </DialogFooter>
          </form>
        </Form>

        {userTickets.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Support Tickets</h3>
              
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'open' 
                        ? 'bg-blue-100 text-blue-700' 
                        : ticket.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status === 'open' 
                        ? 'Open' 
                        : ticket.status === 'in_progress'
                          ? 'In Progress'
                          : 'Resolved'}
                    </div>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                  
                  {ticket.response && (
                    <div className="bg-muted/40 p-3 rounded-md mt-3">
                      <p className="text-xs font-medium mb-1">Admin Response ({formatDate(ticket.respondedAt || 0)}):</p>
                      <p className="text-sm whitespace-pre-wrap">{ticket.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketModal;

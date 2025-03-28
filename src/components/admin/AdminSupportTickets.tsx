
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoveDown, MoveUp, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SupportTicket, TicketStatus } from "@/lib/types";
import { loadSupportTickets, updateTicketStatus } from "@/lib/support";
import { toast } from "sonner";

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Load tickets
    const ticketData = loadSupportTickets();
    setTickets(ticketData);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc"); // Default to newest first for createdAt
    }
  };

  const filterTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTickets = [...filterTickets].sort((a, b) => {
    if (sortBy === "createdAt") {
      return sortOrder === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
    } else if (sortBy === "username") {
      return sortOrder === "asc" ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
    } else if (sortBy === "status") {
      return sortOrder === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const handleRespond = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponse("");
    setIsDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (selectedTicket && response.trim()) {
      const updatedTicket = {
        ...selectedTicket,
        status: "resolved" as TicketStatus,
        response: response,
        respondedAt: Date.now(),
      };
      
      // Update ticket
      updateTicketStatus(selectedTicket.id, updatedTicket);
      
      // Update local state
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      
      toast.success("Response sent to user");
      setIsDialogOpen(false);
    }
  };

  const getStatusBadgeClasses = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Manage user support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("username")}
              >
                User
                {sortBy === "username" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div className="col-span-3">Subject</div>
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Date
                {sortBy === "createdAt" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status
                {sortBy === "status" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div className="col-span-3">Actions</div>
            </div>
            
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket, index) => (
                <div key={ticket.id} className={`grid grid-cols-12 p-4 ${index !== sortedTickets.length - 1 ? "border-b" : ""}`}>
                  <div className="col-span-2 truncate">{ticket.username}</div>
                  <div className="col-span-3 truncate">{ticket.subject}</div>
                  <div className="col-span-2">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClasses(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="col-span-3 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRespond(ticket)}
                      disabled={ticket.status === "resolved"}
                    >
                      {ticket.status === "resolved" ? "Resolved" : "Respond"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No support tickets found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket && (
                <div className="mt-2">
                  <p className="font-semibold">{selectedTicket.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTicket.username} • {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 p-3 bg-muted/30 rounded-md text-sm">
                    {selectedTicket.message}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Type your response here..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitResponse}>Send Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSupportTickets;

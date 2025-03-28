
import { SupportTicket } from "./types";

// Save support ticket
export const createSupportTicket = (ticket: SupportTicket): void => {
  const tickets = loadSupportTickets();
  tickets.push(ticket);
  saveSupportTickets(tickets);
};

// Get all support tickets
export const loadSupportTickets = (): SupportTicket[] => {
  const ticketsData = localStorage.getItem('moonshot_support_tickets');
  return ticketsData ? JSON.parse(ticketsData) : [];
};

// Save all support tickets
export const saveSupportTickets = (tickets: SupportTicket[]): void => {
  localStorage.setItem('moonshot_support_tickets', JSON.stringify(tickets));
};

// Get user tickets
export const getUserTickets = (userId: string): SupportTicket[] => {
  const tickets = loadSupportTickets();
  return tickets.filter(ticket => ticket.userId === userId);
};

// Update ticket status
export const updateTicketStatus = (
  ticketId: string, 
  updatedTicket: Partial<SupportTicket>
): void => {
  const tickets = loadSupportTickets();
  const updatedTickets = tickets.map(ticket => 
    ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
  );
  saveSupportTickets(updatedTickets);
};

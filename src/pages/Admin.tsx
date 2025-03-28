
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Ticket, CreditCard, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import AdminUserList from "@/components/admin/AdminUserList";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";
import AdminTransactions from "@/components/admin/AdminTransactions";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { initialWalletState, loadWalletState } from "@/lib/wallet";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletState, setWalletState] = useState(() => loadWalletState() || initialWalletState);
  
  // Check if user is admin
  useEffect(() => {
    // Admin credentials check - only allow access to admin@moonshot.com
    const isAdmin = user?.email === "iamadmin@moonshot.com";
    if (!isAdmin) {
      navigate('/game');
      toast.error("You don't have permission to access the admin panel");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState} 
        openWalletModal={() => {}} 
      />
      
      <main className="page-container pt-24">
        <div className="mb-8 flex items-center">
          <Link to="/game" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, tickets, and transactions</p>
          </div>
        </div>
        
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center">
              <Ticket className="h-4 w-4 mr-2" /> Support
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" /> Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-6">
            <AdminAnalytics />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <AdminUserList />
          </TabsContent>
          
          <TabsContent value="tickets" className="mt-6">
            <AdminSupportTickets />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <AdminTransactions />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

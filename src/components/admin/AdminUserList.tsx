
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoveDown, MoveUp, UserCheck, Wallet } from "lucide-react";
import { UserState } from "@/lib/types";
import { toast } from "sonner";

const AdminUserList = () => {
  const [users, setUsers] = useState<UserState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    // Load users from localStorage
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('moonshot_users');
      if (storedUsers) {
        try {
          const usersObj = JSON.parse(storedUsers);
          // Ensure we're getting an array of user objects
          if (usersObj && typeof usersObj === 'object') {
            // Convert object of objects to array of objects
            const usersList = Object.values(usersObj).map((user: any) => ({
              ...user.userData,
              id: user.userData.id || Math.random().toString(36).substr(2, 9),
              username: user.userData.username || user.userData.email?.split('@')[0] || 'Anonymous',
              isLoggedIn: !!user.userData.isLoggedIn,
              isNewUser: !!user.userData.isNewUser,
              hasDeposited: !!user.userData.hasDeposited
            }));
            
            // Add admin if not present
            const adminExists = usersList.some(user => user.email === "iamadmin@moonshot.com");
            if (!adminExists) {
              usersList.push({
                id: "admin-user",
                username: "Admin",
                email: "iamadmin@moonshot.com",
                isLoggedIn: false,
                isNewUser: false,
                hasDeposited: true
              });
              
              // Save updated users including admin
              const updatedUsersObj = { ...usersObj };
              updatedUsersObj["admin-user"] = {
                userData: {
                  id: "admin-user",
                  username: "Admin",
                  email: "iamadmin@moonshot.com",
                  isLoggedIn: false,
                  isNewUser: false,
                  hasDeposited: true
                }
              };
              localStorage.setItem('moonshot_users', JSON.stringify(updatedUsersObj));
            }
            
            setUsers(usersList as UserState[]);
          }
        } catch (error) {
          console.error("Error parsing users:", error);
          setUsers([]);
        }
      } else {
        // Create admin user if no users exist
        const adminUser = {
          id: "admin-user",
          username: "Admin",
          email: "iamadmin@moonshot.com",
          isLoggedIn: false,
          isNewUser: false,
          hasDeposited: true
        };
        
        // Save admin user
        const usersObj = {
          "admin-user": {
            userData: adminUser
          }
        };
        localStorage.setItem('moonshot_users', JSON.stringify(usersObj));
        setUsers([adminUser]);
      }
    };
    
    loadUsers();
    
    // Set up an interval to refresh user data every few seconds
    const interval = setInterval(loadUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  
  const handleAddDeposit = (userId: string) => {
    // Add deposit functionality
    const storedUsers = localStorage.getItem('moonshot_users');
    if (storedUsers) {
      try {
        const usersObj = JSON.parse(storedUsers);
        const userKey = Object.keys(usersObj).find(key => usersObj[key].userData.id === userId);
        
        if (userKey) {
          // Update user
          usersObj[userKey].userData.hasDeposited = true;
          // Save back to localStorage
          localStorage.setItem('moonshot_users', JSON.stringify(usersObj));
          // Update state
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? {...user, hasDeposited: true} : user
          ));
          toast.success("Deposit approved for user");
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "username") {
      return sortOrder === "asc" 
        ? (a.username || "").localeCompare(b.username || "") 
        : (b.username || "").localeCompare(a.username || "");
    } else if (sortBy === "email") {
      return sortOrder === "asc" 
        ? (a.email || "").localeCompare(b.email || "")
        : (b.email || "").localeCompare(a.email || "");
    }
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
            <div 
              className="col-span-3 flex items-center cursor-pointer"
              onClick={() => handleSort("username")}
            >
              Username
              {sortBy === "username" && (
                sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
              )}
            </div>
            <div 
              className="col-span-4 flex items-center cursor-pointer"
              onClick={() => handleSort("email")}
            >
              Email
              {sortBy === "email" && (
                sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
              )}
            </div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>
          
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user, index) => (
              <div key={user.id} className={`grid grid-cols-12 p-4 ${index !== sortedUsers.length - 1 ? "border-b" : ""}`}>
                <div className="col-span-3 flex items-center">
                  {user.username || "N/A"}
                  {user.email === "iamadmin@moonshot.com" && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <div className="col-span-4 truncate">{user.email || "N/A"}</div>
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isNewUser ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                      {user.isNewUser ? "New User" : "Regular"}
                    </span>
                    {user.hasDeposited && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Deposited
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-3 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <UserCheck className="mr-1 h-4 w-4" /> View
                  </Button>
                  {!user.hasDeposited && user.email !== "iamadmin@moonshot.com" && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => handleAddDeposit(user.id || "")}
                    >
                      <Wallet className="mr-1 h-4 w-4" /> Add Deposit
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No users found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserList;

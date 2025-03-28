
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Menu, LogOut, User, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletState } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BonusTimer from "./BonusTimer";

interface HeaderProps {
  walletState: WalletState;
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
  openWalletModal: () => void;
}

const Header = ({ walletState, setWalletState, openWalletModal }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if user is admin - for demo purposes, we'll use a simple check
  // In a real app, you would have a proper role system
  const isAdmin = user?.email?.includes('admin') || user?.username?.includes('admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeposit = () => {
    navigate("/deposit");
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? "glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Moonshot X
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/game" className="font-medium hover:text-primary transition-colors">
            Play
          </Link>
          
          {user?.isNewUser && <BonusTimer compact />}
          
          {/* User Menu */}
          {user?.isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Button onClick={handleDeposit} variant="outline" size="sm">
                <Wallet className="mr-2 h-4 w-4" /> Deposit
              </Button>
              
              {/* Admin Panel Link - Only show for admin users */}
              {isAdmin && (
                <Button onClick={() => navigate("/admin")} variant="outline" size="sm" className="bg-primary/10">
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.username || user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/history" className="flex items-center w-full">
                      <span className="mr-2">🕒</span>
                      <span>Transaction History</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 glass-dark md:hidden flex flex-col pt-20 px-6 animate-fade-in">
          <nav className="flex flex-col space-y-6 items-center">
            <Link 
              to="/" 
              className="text-xl font-medium"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/game" 
              className="text-xl font-medium"
              onClick={closeMenu}
            >
              Play
            </Link>
            
            {user?.isNewUser && <BonusTimer compact />}
            
            {user?.isLoggedIn ? (
              <>
                <Button onClick={handleDeposit} className="w-full">
                  <Wallet className="mr-2 h-4 w-4" /> Deposit
                </Button>
                
                {/* Admin Panel Link - Mobile */}
                {isAdmin && (
                  <Link to="/admin" className="w-full" onClick={closeMenu}>
                    <Button variant="outline" className="w-full bg-primary/10">
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </Button>
                  </Link>
                )}
                
                <Link to="/history" className="w-full" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">
                    <span className="mr-2">🕒</span> Transaction History
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col w-full space-y-4">
                <Link to="/login" className="w-full" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/signup" className="w-full" onClick={closeMenu}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

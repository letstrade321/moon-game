
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import GameBackground from "@/components/GameBackground";
import Header from "@/components/Header";
import { initialWalletState } from "@/lib/wallet";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [walletState, setWalletState] = useState(initialWalletState);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/game");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <GameBackground />
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState} 
        openWalletModal={() => {}} 
      />
      
      <main className="page-container pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Log In</h1>
              <p className="text-muted-foreground">Welcome back to Moonshot X</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Login to Your Account</CardTitle>
                <CardDescription>Welcome back, enter your credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="mr-2">Logging in</span>
                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Login <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p>
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Welcome to Moonshot X</CardTitle>
                <CardDescription>Your premium gaming experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="font-medium mb-1 text-primary">Try Our New Game: Moonballs!</h3>
                  <p className="text-sm">
                    Your next 1000x win is waiting. Play now and win big!
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Premium Features</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                    <li>High-risk multipliers up to 2000x</li>
                    <li>Multiple crypto payment options</li>
                    <li>Realistic game physics</li>
                    <li>Multi-ball drops (up to 50 balls)</li>
                    <li>Secure wallet integration</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you encounter any issues with your account, please contact support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

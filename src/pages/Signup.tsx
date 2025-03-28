
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
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
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [walletState, setWalletState] = useState(initialWalletState);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password);
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
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
              <p className="text-muted-foreground">Join Moonshot X today</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Sign Up for Moonshot X</CardTitle>
                <CardDescription>Create your account to start playing</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="glass p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 my-4">
                      <div className="text-primary font-bold">New Player Offer!</div>
                      <div className="text-xl font-bold">50% DEPOSIT BONUS</div>
                      <div className="text-sm text-muted-foreground">Valid for 60 minutes after signup</div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="mr-2">Creating account</span>
                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-center text-sm mt-4">
                      <p>
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline">
                          Login
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
                <CardTitle>Why Join Moonshot X?</CardTitle>
                <CardDescription>Experience our premium gaming platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="font-medium mb-1 text-primary">Try Our New Game: Moonballs!</h3>
                  <p className="text-sm">
                    Your next 1000x win is waiting. Play now and win big!
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Benefits</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                    <li>Exclusive 50% first deposit bonus</li>
                    <li>Multiple crypto payment options</li>
                    <li>24/7 customer support</li>
                    <li>Fast withdrawals</li>
                    <li>Secure gaming environment</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your account and make your first deposit to claim your 50% bonus!
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

export default Signup;

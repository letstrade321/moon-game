
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, ArrowDown, ArrowUp } from "lucide-react";
import { initialWalletState } from "@/lib/wallet";

const Index = () => {
  const [walletState, setWalletState] = useState(initialWalletState);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState} 
        openWalletModal={() => {}} 
      />
      
      <main className="pt-16">
        <Hero />
        
        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform makes gaming simple and fun.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                    </div>
                    Start Playing
                  </CardTitle>
                  <CardDescription>
                    Jump right into our exciting games.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    No setup needed. Just start playing and enjoy the excitement.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <ArrowDown className="h-5 w-5 text-primary" />
                    </div>
                    Stake & Play
                  </CardTitle>
                  <CardDescription>
                    Bet and start playing exciting games.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Choose your stake amount and start playing our exclusive
                    games with real stakes.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <ArrowUp className="h-5 w-5 text-primary" />
                    </div>
                    Win & Collect
                  </CardTitle>
                  <CardDescription>
                    Win and collect your rewards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Your winnings are credited to your account in real-time. 
                    Collect anytime with no delays.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Start Playing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of gamers and experience the future of gaming today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/game">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Play Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CryptoGame. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

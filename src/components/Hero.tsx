
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-down">
          Play. Win. <span className="text-primary">Withdraw.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-down" style={{ animationDelay: '0.1s' }}>
          Experience seamless crypto gaming with real-time wallet synchronization. 
          Deposit crypto, play our exclusive games, and withdraw your winnings instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-down" style={{ animationDelay: '0.2s' }}>
          <Link to="/game">
            <Button size="lg" className="rounded-full px-8 py-6 text-lg">
              Play Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <a href="#features">
            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg">
              Learn More
            </Button>
          </a>
        </div>
      </div>
      
      {/* Scrolling indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-8 h-14 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-slide-down opacity-75"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

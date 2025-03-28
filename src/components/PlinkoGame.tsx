import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GamepadIcon, ChevronDown, Trophy, AlertCircle, ArrowUp, ArrowDown, TriangleAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameState, WalletState, RiskLevel, RiskMultipliers, RiskColors, RiskLabels, MultiplierRarity } from "@/lib/types";
import { toast } from "sonner";
import { registerGameResult, saveWalletState } from "@/lib/wallet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface PlinkoGameProps {
  walletState: WalletState;
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({ walletState, setWalletState }) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentBet: undefined,
    lastResult: undefined,
    winAmount: undefined,
    gameCount: 0,
    plinkoPath: [],
    multiplier: 0,
    ballCount: 1
  });
  
  const [betAmount, setBetAmount] = useState("");
  const [riskLevel, setRiskLevel] = useState<number[]>([1]); // 0 = Low, 1 = Medium, 2 = High
  const [ballCount, setBallCount] = useState<number[]>([1]); // Default to 1 ball
  const [rowCount, setRowCount] = useState<number[]>([12]); // Default to 12 rows, but will be fixed
  const plinkoRef = useRef<HTMLDivElement>(null);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: -30 });
  const [showBall, setShowBall] = useState(false);
  const [bouncingPoints, setBouncingPoints] = useState<{x: number, y: number, time: number, velocity: number}[]>([]);
  const [sparklePoints, setSparklePoints] = useState<{x: number, y: number, time: number}[]>([]);
  const [activeBalls, setActiveBalls] = useState<{id: number, x: number, y: number, path: number[], finalMultiplier: number, isWin: boolean}[]>([]);
  
  // Define new risk levels and multipliers with updated values
  const generateMultipliersForRisk = (risk: RiskLevel, rows: number): number[] => {
    const multipliersCount = rows + 1;
    let multipliers: number[] = [];
    
    // Base multipliers per risk level - CHANGED: Moved high multipliers to sides, low to middle
    const baseMultipliers = {
      0: [10, 5, 2, 0.1, 0.3, 0.5, 2, 5, 10], // Low risk
      1: [50, 20, 10, 5, 2, 0.5, 0.3, 0.1, 2, 5, 10, 20, 50], // Medium risk
      2: [1500, 1000, 50, 7, 5, 2, 0.5, 0.3, 0.1, 2, 5, 7, 50, 1000, 1500], // High risk
    };
    
    // Ensure we have the right number of multipliers based on row count
    if (multipliersCount <= baseMultipliers[risk as keyof typeof baseMultipliers].length) {
      // Just take the number of multipliers we need
      const baseMults = baseMultipliers[risk as keyof typeof baseMultipliers];
      const halfMultipliers = Math.floor(multipliersCount / 2);
      
      // For even number of multipliers
      if (multipliersCount % 2 === 0) {
        // Take from both sides of the distribution
        const leftSide = baseMults.slice(0, halfMultipliers);
        const rightSide = baseMults.slice(baseMults.length - halfMultipliers);
        multipliers = [...leftSide, ...rightSide];
      } else {
        // For odd number of multipliers, include middle item
        const middle = Math.floor(baseMults.length / 2);
        const leftCount = halfMultipliers;
        const rightCount = halfMultipliers;
        
        const leftSide = baseMults.slice(0, leftCount);
        const middleValue = [baseMults[middle]];
        const rightSide = baseMults.slice(baseMults.length - rightCount);
        
        multipliers = [...leftSide, ...middleValue, ...rightSide];
      }
    } else {
      // For large number of rows, create a multiplier array with the pattern:
      // high values on edges, low values in middle
      multipliers = Array(multipliersCount).fill(0.1); // Default low value
      
      const middle = Math.floor(multipliersCount / 2);
      
      // Set middle to lowest values
      multipliers[middle] = 0.1;
      if (multipliersCount % 2 === 0) {
        multipliers[middle - 1] = 0.1;
      }
      
      // Add decreasing values as we move from edges to center
      const leftValues = risk === 0 
        ? [10, 5, 2, 0.5, 0.3] 
        : risk === 1
          ? [50, 20, 10, 5, 2, 0.5, 0.3]
          : [1500, 1000, 50, 7, 5, 2, 0.5, 0.3];
          
      const rightValues = [...leftValues].reverse();
      
      // Fill left side (highest values first)
      for (let i = 0; i < Math.min(leftValues.length, middle); i++) {
        multipliers[i] = leftValues[i];
      }
      
      // Fill right side (highest values first)
      for (let i = 0; i < Math.min(rightValues.length, middle); i++) {
        multipliers[multipliersCount - 1 - i] = rightValues[i];
      }
    }
    
    return multipliers;
  };
  
  // Create a state for the current multipliers
  const [currentMultipliers, setCurrentMultipliers] = useState<number[]>(
    generateMultipliersForRisk(riskLevel[0] as RiskLevel, rowCount[0])
  );
  
  // Update multipliers when risk level or row count changes
  useEffect(() => {
    setCurrentMultipliers(
      generateMultipliersForRisk(riskLevel[0] as RiskLevel, rowCount[0])
    );
  }, [riskLevel, rowCount]);
  
  // Rarity distributions for each multiplier
  const LOW_RISK_RARITY: MultiplierRarity[] = [
    { value: 10, probability: 0.02 }, // 2% chance for 10x
  ];
  
  const MED_RISK_RARITY: MultiplierRarity[] = [
    { value: 20, probability: 0.02 }, // 2% chance for 20x
    { value: 50, probability: 0.01 }, // 1% chance for 50x
  ];
  
  const HIGH_RISK_RARITY: MultiplierRarity[] = [
    { value: 50, probability: 0.01 }, // 1% chance for 50x 
    { value: 1000, probability: 0.003 }, // 0.3% chance for 1000x
    { value: 1500, probability: 0.001 }, // 0.1% chance for 1500x
  ];
  
  const RISK_COLORS: RiskColors = {
    0: "bg-blue-500/20 border-blue-500", // Low risk
    1: "bg-yellow-500/20 border-yellow-500", // Medium risk 
    2: "bg-red-500/20 border-red-500", // High risk
  };
  
  const RISK_LABELS: RiskLabels = {
    0: "Low Risk",
    1: "Medium Risk",
    2: "High Risk"
  };
  
  // Add getMultiplierRarity function
  const getMultiplierRarity = (multiplier: number): string => {
    if (multiplier >= 1000) return "Ultra Rare";
    if (multiplier >= 100) return "Very Rare";
    if (multiplier >= 50) return "Rare";
    if (multiplier >= 10) return "Uncommon";
    if (multiplier >= 1) return "Common";
    return "Loss";
  };
  
  // Remove sparkles and bounce effects after some time
  useEffect(() => {
    const now = Date.now();
    const interval = setInterval(() => {
      setBouncingPoints(prev => prev.filter(point => now - point.time < 1500));
      setSparklePoints(prev => prev.filter(point => now - point.time < 1000));
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleStartGame = async () => {
    const amount = parseFloat(betAmount);
    const numBalls = ballCount[0];
    
    // Validation
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (!walletState.balance || (amount * numBalls) > walletState.balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    // Track initial deposit if first game
    if (!walletState.initialDeposit && walletState.gameCount === 0) {
      setWalletState(prev => ({
        ...prev,
        initialDeposit: prev.balance
      }));
    }
    
    // Reset path and start game
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentBet: amount,
      lastResult: undefined,
      winAmount: undefined,
      gameCount: (prev.gameCount || 0) + 1,
      plinkoPath: [],
      ballCount: numBalls
    }));
    
    // Clear previous bounce points and active balls
    setBouncingPoints([]);
    setSparklePoints([]);
    setActiveBalls([]);
    
    // Start animation for each ball
    for (let i = 0; i < numBalls; i++) {
      setTimeout(() => {
        startPlinkoAnimation(amount, i);
      }, i * 300); // Stagger the start of each ball
    }
  };

  const startPlinkoAnimation = (betAmount: number, ballId: number) => {
    setShowBall(true);
    
    // Generate path with bias based on the current risk level
    const path: number[] = [];
    const gameCount = gameState.gameCount || 0;
    const currentRisk = riskLevel[0] as RiskLevel;
    
    // CHANGED: Modified to bias ball to land on decimal multipliers 90% of the time
    const shouldLandOnDecimal = Math.random() < 0.9; // 90% chance
    const decimalMultiplierPositions = getCurrentDecimalPositions();
    
    // Create a path through the pins - modify bias based on the target position
    let targetPosition: number | null = null;
    
    if (shouldLandOnDecimal && decimalMultiplierPositions.length > 0) {
      // Pick a random decimal multiplier position
      const randomIndex = Math.floor(Math.random() * decimalMultiplierPositions.length);
      targetPosition = decimalMultiplierPositions[randomIndex];
    }
    
    // Generate the path to reach the target or a random path
    const middlePosition = Math.floor(currentMultipliers.length / 2);
    let currentPosition = middlePosition;
    
    for (let i = 0; i < rowCount[0]; i++) {
      let direction: number;
      
      if (targetPosition !== null) {
        // Need to guide toward target
        const stepsRemaining = rowCount[0] - i;
        const positionDiff = targetPosition - currentPosition;
        
        // Determine which way to go for this step
        if (positionDiff > 0) {
          // Need to move right
          if (Math.random() < 0.75) { // Bias toward target
            direction = 1; // Right
          } else {
            direction = 0; // Left
          }
        } else if (positionDiff < 0) {
          // Need to move left
          if (Math.random() < 0.75) { // Bias toward target
            direction = 0; // Left
          } else {
            direction = 1; // Right
          }
        } else {
          // Already on target path, random
          direction = Math.random() < 0.5 ? 0 : 1;
        }
      } else {
        // No target, just random
        direction = Math.random() < 0.5 ? 0 : 1;
      }
      
      path.push(direction);
      currentPosition += direction === 0 ? -1 : 1;
    }
    
    // Get final multiplier based on path
    const multipliers = currentMultipliers;
    let finalBucket = Math.floor(multipliers.length / 2); // Start at middle
    
    // Calculate final bucket based on path
    for (let i = 0; i < path.length; i++) {
      const direction = path[i] === 0 ? -1 : 1;
      finalBucket += direction;
    }
    
    // Ensure final bucket is within range
    finalBucket = Math.max(0, Math.min(multipliers.length - 1, finalBucket));
    const finalMultiplier = multipliers[finalBucket];
    const isWin = finalMultiplier > 1;
    
    // Add new active ball
    setActiveBalls(prev => [...prev, {
      id: ballId,
      x: 0,
      y: -30,
      path,
      finalMultiplier,
      isWin
    }]);
    
    // Simulate ball drop with enhanced animation
    simulateBallDrop(path, betAmount, currentRisk, ballId, finalMultiplier, isWin);
  };
  
  // Function to find positions of decimal multipliers
  const getCurrentDecimalPositions = (): number[] => {
    const positions: number[] = [];
    currentMultipliers.forEach((multiplier, index) => {
      if (multiplier < 1) {
        positions.push(index);
      }
    });
    return positions;
  };
  
  const simulateBallDrop = (
    path: number[], 
    betAmount: number, 
    riskLevel: RiskLevel, 
    ballId: number,
    finalMultiplier: number,
    isWin: boolean
  ) => {
    const multipliers = currentMultipliers;
    const pinDistance = 35; // Smaller distance for more pins
    const animationDuration = 250; // Slower animation for more realistic physics
    
    let currentPosition = { x: 0, y: 0 };
    let finalBucket = Math.floor(multipliers.length / 2); // Start at middle
    
    // Animate through each row with bounce effect
    for (let i = 0; i < path.length; i++) {
      const direction = path[i] === 0 ? -1 : 1;
      
      setTimeout(() => {
        currentPosition = {
          x: currentPosition.x + (direction * pinDistance / 2),
          y: currentPosition.y + pinDistance
        };
        
        // Add a slight random offset to make bouncing look more natural
        const bounceOffsetX = (Math.random() - 0.5) * 8;
        const velocity = 2 + Math.random() * 3; // Random vertical velocity for bounce
        
        const bouncePosition = {
          x: currentPosition.x + bounceOffsetX,
          y: currentPosition.y,
          time: Date.now(),
          velocity: velocity
        };
        
        // Add bounce position to the array
        setBouncingPoints(prev => [...prev, bouncePosition]);
        
        // Add sparkle effect at bounce points
        setSparklePoints(prev => [
          ...prev, 
          {
            x: currentPosition.x + bounceOffsetX,
            y: currentPosition.y - 5, // Slightly above the bounce point
            time: Date.now()
          }
        ]);
        
        // Update ball position
        setActiveBalls(prev => prev.map(ball => 
          ball.id === ballId 
            ? { ...ball, x: currentPosition.x, y: currentPosition.y } 
            : ball
        ));
        
        finalBucket += direction;
      }, i * animationDuration);
    }
    
    // Ensure final bucket is within range
    finalBucket = Math.max(0, Math.min(multipliers.length - 1, finalBucket));
    
    // Final animation to the bucket
    setTimeout(() => {
      // Calculate final position
      const finalX = (finalBucket - Math.floor(multipliers.length / 2)) * pinDistance;
      const finalY = rowCount[0] * pinDistance + 20; // The bottom position
      
      // Update active balls with final position
      setActiveBalls(prev => prev.map(ball => 
        ball.id === ballId 
          ? { ...ball, x: finalX, y: finalY } 
          : ball
      ));
      
      // Add final bounce position
      const finalBouncePosition = {
        x: finalX,
        y: finalY,
        time: Date.now(),
        velocity: 5 // Higher velocity for final impact
      };
      
      setBouncingPoints(prev => [...prev, finalBouncePosition]);
      
      // Add multiple sparkles for the final landing
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          setSparklePoints(prev => [
            ...prev, 
            {
              x: finalX + (Math.random() - 0.5) * 20,
              y: finalY - Math.random() * 10,
              time: Date.now()
            }
          ]);
        }, i * 100);
      }
      
      // Handle final result
      finishBall(ballId, betAmount, finalMultiplier);
      
      // If this is the last ball, finalize the game
      setTimeout(() => {
        if (ballId === ballCount[0] - 1) {
          finalizeGame();
        }
      }, 1000);
    }, (path.length + 1) * animationDuration);
  };

  const finishBall = (ballId: number, betAmount: number, multiplier: number) => {
    // Calculate win amount for this ball
    const ballWinAmount = betAmount * multiplier;
    
    // Update the wallet balance immediately for this ball
    setWalletState(prev => ({
      ...prev,
      balance: (prev.balance || 0) + ballWinAmount - betAmount, // Add winnings or subtract loss
    }));
  };
  
  const finalizeGame = () => {
    // Calculate total results from all balls
    const totalBet = parseFloat(betAmount) * ballCount[0];
    let totalWinnings = 0;
    let winCount = 0;
    
    activeBalls.forEach(ball => {
      const ballWinAmount = parseFloat(betAmount) * ball.finalMultiplier;
      totalWinnings += ballWinAmount;
      if (ball.isWin) winCount++;
    });
    
    const netResult = totalWinnings - totalBet;
    const isOverallWin = netResult > 0;
    const result = isOverallWin ? 'win' : 'loss';
    
    // Create a transaction for the overall game result
    registerGameResult(result, Math.abs(netResult)).then(transaction => {
      // Update wallet state with transaction
      setWalletState(prev => {
        const updatedState = {
          ...prev,
          transactions: [transaction, ...prev.transactions],
          gameCount: (prev.gameCount || 0) + 1
        };
        
        // Save wallet state
        saveWalletState(updatedState);
        return updatedState;
      });
    });
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      lastResult: result,
      winAmount: isOverallWin ? netResult : 0,
    }));
    
    // Display toast notification
    if (isOverallWin) {
      toast.success(`You won $${netResult.toFixed(2)}! (${winCount}/${ballCount[0]} winning balls)`);
    } else {
      toast.error(`You lost $${Math.abs(netResult).toFixed(2)}`);
    }
    
    // Hide balls after a delay
    setTimeout(() => {
      setActiveBalls([]);
      setShowBall(false);
    }, 2000);
  };
  
  const shouldHitRareMultiplier = (riskLevel: RiskLevel): boolean => {
    // Determine which rarity distribution to use
    let rarityDistribution: MultiplierRarity[] = [];
    
    if (riskLevel === 0) rarityDistribution = LOW_RISK_RARITY;
    else if (riskLevel === 1) rarityDistribution = MED_RISK_RARITY;
    else rarityDistribution = HIGH_RISK_RARITY;
    
    // Sum up all probabilities to get total chance
    const totalProbability = rarityDistribution.reduce((sum, item) => sum + item.probability, 0);
    
    // Roll the dice
    return Math.random() < totalProbability;
  };

  const determineIfShouldWin = (gameCount: number, walletState: WalletState, riskLevel: RiskLevel): boolean => {
    // First few games are losses
    if (gameCount <= 3) {
      return false;
    }
    
    // Check if player is ahead of their initial deposit
    const isAhead = walletState.balance && walletState.initialDeposit && 
                   walletState.balance > walletState.initialDeposit;
    
    // Base chance modified by risk level
    let winChance = 0.4; // Default 40% chance
    
    // Adjust win chance based on risk level
    if (riskLevel === 0) {
      winChance = 0.5; // Low risk, higher chance to win, but lower payouts
    } else if (riskLevel === 1) {
      winChance = 0.4; // Medium risk, moderate chance
    } else if (riskLevel === 2) {
      winChance = 0.2; // High risk, low chance, but high payouts
    }
                  
    // If player is ahead, make it harder to win
    if (isAhead) {
      winChance = winChance * 0.5; // Half the chance if ahead
    }
    
    return Math.random() < winChance;
  };
  
  const resetGame = () => {
    setBetAmount("");
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentBet: undefined,
      lastResult: undefined,
      winAmount: undefined,
      plinkoPath: [],
      multiplier: 0,
      ballCount: ballCount[0]
    }));
    setBouncingPoints([]);
    setSparklePoints([]);
    setActiveBalls([]);
  };
  
  const getRiskLevelLabel = () => {
    return RISK_LABELS[riskLevel[0] as keyof typeof RISK_LABELS];
  };
  
  // Render pins in a triangular pattern
  const renderPins = () => {
    const pins = [];
    const pinSize = 4; // Smaller pins for a more dense pattern
    const horizontalSpacing = 35; // Smaller spacing for more pins
    const verticalSpacing = 35; // Smaller spacing for more pins
    
    for (let row = 0; row < rowCount[0]; row++) {
      const pinsInRow = row + 1;
      const rowWidth = pinsInRow * horizontalSpacing;
      const xOffset = -rowWidth / 2 + horizontalSpacing / 2;
      
      for (let pin = 0; pin < pinsInRow; pin++) {
        const x = xOffset + pin * horizontalSpacing;
        const y = row * verticalSpacing;
        pins.push(
          <div 
            key={`${row}-${pin}`}
            className="absolute bg-primary rounded-full shadow-glow"
            style={{
              width: pinSize,
              height: pinSize,
              left: `calc(50% + ${x}px)`,
              top: y,
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      }
    }
    return pins;
  };
  
  // Render multiplier buckets
  const renderBuckets = () => {
    return (
      <div className="flex justify-between items-end h-16 mt-4">
        {currentMultipliers.map((multiplier, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center ${RISK_COLORS[riskLevel[0] as RiskLevel]}`}
            style={{ margin: '0 4px' }} // Add 2 spaces between each multiplier
          >
            <div className="text-sm font-bold">
              {multiplier}x
            </div>
            <div className="text-xs text-muted-foreground">
              {getMultiplierRarity(multiplier)}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render visual bouncing effect
  const renderBounceEffects = () => {
    return bouncingPoints.map((point, index) => {
      // Calculate fade based on time elapsed
      const now = Date.now();
      const elapsed = now - point.time;
      const opacity = Math.max(0, 1 - elapsed / 1000);
      
      if (opacity <= 0) return null;
      
      // Scale effect based on velocity
      const scale = Math.min(1.5, point.velocity / 3);
      
      return (
        <div 
          key={`bounce-${index}`}
          className="absolute rounded-full bg-yellow-300/60"
          style={{
            width: 12 * scale,
            height: 12 * scale,
            left: `calc(50% + ${point.x}px)`,
            top: point.y,
            opacity: opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${8 * scale}px ${4 * scale}px rgba(250, 204, 21, 0.6)`
          }}
        />
      );
    }).filter(effect => effect !== null);
  };
  
  // Render sparkle effects
  const renderSparkleEffects = () => {
    return sparklePoints.map((point, index) => {
      // Calculate fade based on time elapsed
      const now = Date.now();
      const elapsed = now - point.time;
      const opacity = Math.max(0, 1 - elapsed / 800);
      
      if (opacity <= 0) return null;
      
      // Random size for variety
      const size = 3 + Math.random() * 4;
      
      return (
        <div 
          key={`sparkle-${index}`}
          className="absolute bg-white rounded-full"
          style={{
            width: size,
            height: size,
            left: `calc(50% + ${point.x}px)`,
            top: point.y,
            opacity: opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 5px 2px rgba(255, 255, 255, 0.8)'
          }}
        />
      );
    }).filter(effect => effect !== null);
  };
  
  // Render active balls - CHANGED: made ball 50% smaller with solid vector texture
  const renderActiveBalls = () => {
    return activeBalls.map(ball => (
      <motion.div
        key={`ball-${ball.id}`}
        initial={{ x: 0, y: -30 }}
        animate={{ x: ball.x, y: ball.y }}
        transition={{ 
          type: "spring", 
          stiffness: 120,
          damping: 8,
          mass: 1
        }}
        className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full shadow-xl z-10"
        style={{ 
          transform: 'translate(-50%, -50%)',
          background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #f0f0f0 25%, #d0d0d0 60%, #a0a0a0 100%)",
          boxShadow: '0 0 4px rgba(180, 180, 180, 0.8), inset 0 0 2px rgba(0, 0, 0, 0.5)'
        }}
      />
    ));
  };
  
  // Render the visual risk indicator
  const renderRiskIndicator = () => {
    const currentRisk = riskLevel[0] as RiskLevel;
    let icons = null;
    
    if (currentRisk === 0) {
      icons = (
        <div className="flex">
          <ArrowDown className="h-4 w-4 text-blue-500" />
          <ArrowDown className="h-4 w-4 text-blue-500" />
        </div>
      );
    } else if (currentRisk === 1) {
      icons = (
        <div className="flex">
          <ArrowUp className="h-4 w-4 text-yellow-500" />
          <ArrowDown className="h-4 w-4 text-yellow-500" />
        </div>
      );
    } else {
      icons = (
        <div className="flex">
          <ArrowUp className="h-4 w-4 text-red-500" />
          <ArrowUp className="h-4 w-4 text-red-500" />
          <TriangleAlert className="h-4 w-4 ml-1 text-red-500" />
        </div>
      );
    }
    
    return (
      <div className={`text-xs font-medium flex gap-2 items-center p-1 rounded border ${RISK_COLORS[currentRisk as keyof typeof RISK_COLORS]}`}>
        {RISK_LABELS[currentRisk as keyof typeof RISK_LABELS]}
        {icons}
      </div>
    );
  };
  
  // Render the risk comparison table
  const renderRiskComparisonTable = () => {
    return (
      <div className="mt-4 rounded-md border overflow-hidden text-xs">
        <div className="grid grid-cols-4 bg-muted/50 font-semibold">
          <div className="p-2">Risk Level</div>
          <div className="p-2 text-center">Win Chance</div>
          <div className="p-2 text-center">Max Multiplier</div>
          <div className="p-2 text-center">Strategy</div>
        </div>
        
        <div className="grid grid-cols-4 border-t">
          <div className="p-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Low Risk</span>
          </div>
          <div className="p-2 text-center">Higher</div>
          <div className="p-2 text-center">10x</div>
          <div className="p-2 text-center">Steady Wins</div>
        </div>
        
        <div className="grid grid-cols-4 border-t">
          <div className="p-2 flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            <span>Medium Risk</span>
          </div>
          <div className="p-2 text-center">Medium</div>
          <div className="p-2 text-center">50x</div>
          <div className="p-2 text-center">Balanced</div>
        </div>
        
        <div className="grid grid-cols-4 border-t">
          <div className="p-2 flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span>High Risk</span>
          </div>
          <div className="p-2 text-center">Lower</div>
          <div className="p-2 text-center">1500x</div>
          <div className="p-2 text-center">Big Wins</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Game Controls */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="bet-amount">Bet Amount:</Label>
            <Input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
              max={walletState.balance}
              className="w-24"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="risk-level">Risk Level:</Label>
            <Select value={riskLevel.toString()} onValueChange={(value) => setRiskLevel(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Low Risk</SelectItem>
                <SelectItem value="1">Medium Risk</SelectItem>
                <SelectItem value="2">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleStartGame} 
          disabled={
            !betAmount || 
            parseFloat(betAmount) <= 0 || 
            !walletState.balance || 
            walletState.balance <= 0 ||
            (parseFloat(betAmount) * ballCount[0]) > walletState.balance
          }
          className="bg-primary hover:bg-primary/90"
        >
          {gameState.isPlaying ? "Playing..." : "Play"}
        </Button>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-2xl aspect-[2/1] bg-background rounded-lg border shadow-lg overflow-hidden">
        {/* Game Board Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
        
        {/* Game Board Grid */}
        <div className="absolute inset-0 grid grid-cols-9 gap-1 p-1">
          {Array.from({ length: 9 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-9 gap-1">
              {Array.from({ length: 9 }).map((_, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square rounded-full ${
                    gameState.isPlaying && 
                    ballPosition.row === rowIndex && 
                    ballPosition.col === colIndex
                      ? 'bg-primary animate-pulse'
                      : 'bg-muted/30'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Ball */}
        <div 
          className={`absolute w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-200 ease-in-out ${
            gameState.isPlaying ? 'animate-bounce' : ''
          }`}
          style={{
            left: `${(ballPosition.col / 8) * 100}%`,
            top: `${(ballPosition.row / 8) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Pins */}
        {renderPins()}

        {/* Multipliers */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2">
          {currentMultipliers.map((multiplier, index) => (
            <div 
              key={index}
              className={`text-center transition-all duration-300 ${
                gameState.isPlaying && ballPosition.row === 8 && ballPosition.col === index
                  ? 'scale-110 font-bold text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <div className="text-sm font-medium">{multiplier}x</div>
              <div className="text-xs opacity-75">{getMultiplierRarity(multiplier)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="w-full max-w-md grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">${walletState.balance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Games Played</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{walletState.gameCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {walletState.gameCount ? ((walletState.gameCount - (gameState.winAmount === 0 ? 1 : 0)) / walletState.gameCount * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlinkoGame;

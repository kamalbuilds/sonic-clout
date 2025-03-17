"use client";

import React, { useState } from 'react';
import { useSonicVesting } from '@/context/SonicVestingContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { VestingParams, MilestoneConfig } from '@/app/lib/services/sonicVestingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingCircle } from '@/components/LoadingCircle';

const VestingDashboard = () => {
  const {
    isInitializing,
    isCreatingVesting,
    isCheckingMilestones,
    isWithdrawing,
    isFetchingVestings,
    vestingSchedules,
    selectedVestingId,
    initialize,
    createVestingSchedule,
    checkVestingMilestones,
    withdrawVestedTokens,
    fetchVestingSchedules,
    selectVestingSchedule,
  } = useSonicVesting();
  
  const wallet = useWallet();
  const [tabValue, setTabValue] = useState('schedules');
  
  // Creation form state
  const [recipient, setRecipient] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [milestones, setMilestones] = useState<{threshold: number; unlockPercentage: number}[]>([
    { threshold: 1000, unlockPercentage: 2500 },
    { threshold: 2000, unlockPercentage: 2500 },
    { threshold: 3000, unlockPercentage: 2500 },
    { threshold: 4000, unlockPercentage: 2500 },
  ]);
  
  const isConnected = wallet.connected && wallet.publicKey;
  
  // Toggle date picker visibility
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Handle milestone changes
  const handleMilestoneChange = (index: number, unlockPercentage: number) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { 
      ...newMilestones[index], 
      unlockPercentage 
    };
    
    // Adjust other percentages to maintain total of 10000 (100%)
    const totalOthers = newMilestones.reduce(
      (sum, m, i) => (i !== index ? sum + m.unlockPercentage : sum),
      0
    );
    
    // Ensure total is 10000 (100%)
    if (totalOthers + unlockPercentage !== 10000) {
      const remaining = 10000 - unlockPercentage;
      const factor = remaining / totalOthers;
      
      newMilestones.forEach((m, i) => {
        if (i !== index) {
          m.unlockPercentage = Math.round(m.unlockPercentage * factor);
        }
      });
      
      // Adjust the last milestone to ensure exactly 10000 (100%)
      const currentTotal = newMilestones.reduce((sum, m) => sum + m.unlockPercentage, 0);
      if (currentTotal !== 10000) {
        // Find the last milestone that's not the one being edited
        const lastIndex = index === newMilestones.length - 1 
          ? newMilestones.length - 2 
          : newMilestones.length - 1;
        
        if (lastIndex >= 0) {
          newMilestones[lastIndex].unlockPercentage += (10000 - currentTotal);
        }
      }
    }
    
    setMilestones(newMilestones);
  };
  
  // Update milestone thresholds based on start and end dates
  React.useEffect(() => {
    if (startDate && endDate) {
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      const duration = endTime - startTime;
      
      // Calculate milestone thresholds based on equally spaced intervals
      const newMilestones = milestones.map((milestone, index) => {
        const progress = (index + 1) / milestones.length;
        const threshold = Math.floor(1000 + progress * 4000); // Example scale from 1000 to 5000
        return { 
          ...milestone,
          threshold
        };
      });
      
      setMilestones(newMilestones);
    }
  }, [startDate, endDate]);
  
  // Handle form submission to create a new vesting schedule
  const handleCreateVesting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      return;
    }
    
    if (!recipient || !tokenMint || !totalAmount || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (milestones.reduce((sum, m) => sum + m.unlockPercentage, 0) !== 10000) {
      alert('Milestone percentages must add up to 100%');
      return;
    }
    
    try {
      const params: VestingParams = {
        tokenMintAddress: tokenMint,
        amount: parseInt(totalAmount),
        oracleAddress: recipient, // Using recipient field as oracle for demo
        metricType: 'followers',
        milestones: milestones.map(m => ({
          threshold: m.threshold,
          unlockPercentage: m.unlockPercentage
        })),
      };
      
      await createVestingSchedule(params);
      
      // Reset form
      setRecipient('');
      setTokenMint('');
      setTotalAmount('');
      setStartDate(undefined);
      setEndDate(undefined);
      setTabValue('schedules');
    } catch (error) {
      console.error('Error creating vesting schedule:', error);
    }
  };
  
  // Handle checking for new milestones
  const handleCheckMilestones = async (vestingId: number) => {
    if (!isConnected) return;
    await checkVestingMilestones(vestingId);
  };
  
  // Handle withdrawing unlocked tokens
  const handleWithdraw = async (vestingId: number) => {
    if (!isConnected) return;
    await withdrawVestedTokens(vestingId);
  };
  
  // Format a timestamp (in seconds) to a readable date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'PPP');
  };
  
  // Calculate the progress percentage of a vesting schedule
  const calculateProgress = (schedule: any) => {
    if (!schedule.milestones || !schedule.milestones.reached) return 0;
    
    const reachedCount = schedule.milestones.reached.filter((r: boolean) => r).length;
    const totalMilestones = schedule.milestones.reached.length;
    
    if (totalMilestones === 0) return 0;
    return Math.floor((reachedCount / totalMilestones) * 100);
  };
  
  // Calculate the unlocked amount for a vesting schedule
  const calculateUnlockedAmount = (schedule: any) => {
    if (!schedule.milestones || !schedule.milestones.reached || !schedule.milestones.unlockPercentages) return 0;
    
    let unlockedPercentage = 0;
    for (let i = 0; i < schedule.milestones.reached.length; i++) {
      if (schedule.milestones.reached[i]) {
        unlockedPercentage += schedule.milestones.unlockPercentages[i];
      }
    }
    
    return Math.floor((parseInt(schedule.totalAmount) * unlockedPercentage) / 10000);
  };
  
  // Format milestone display data
  const formatMilestones = (schedule: any) => {
    if (!schedule.milestones) return [];
    
    const { thresholds, unlockPercentages, reached } = schedule.milestones;
    if (!thresholds || !unlockPercentages || !reached) return [];
    
    return thresholds.map((threshold: number, index: number) => ({
      threshold,
      unlockPercentage: unlockPercentages[index],
      unlocked: reached[index]
    }));
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Sonic Token Vesting</h1>
      
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view and manage vesting schedules
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="schedules">Vesting Schedules</TabsTrigger>
            <TabsTrigger value="create">Create Vesting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedules">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Vesting Schedules</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchVestingSchedules()}
                    disabled={isFetchingVestings}
                  >
                    {isFetchingVestings ? <LoadingCircle size="small" /> : 'Refresh'}
                  </Button>
                  <Button
                    onClick={() => initialize()}
                    disabled={isInitializing}
                  >
                    {isInitializing ? <LoadingCircle size="small" /> : 'Initialize Program'}
                  </Button>
                </div>
              </div>
              
              {isFetchingVestings ? (
                <div className="flex justify-center p-12">
                  <LoadingCircle />
                </div>
              ) : vestingSchedules.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Vesting Schedules</CardTitle>
                    <CardDescription>
                      You don't have any vesting schedules yet
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={() => setTabValue('create')}>Create One</Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {vestingSchedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardHeader>
                        <CardTitle>Vesting ID: {schedule.id}</CardTitle>
                        <CardDescription>
                          Creator: {schedule.creator.slice(0, 6)}...{schedule.creator.slice(-4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Token</p>
                              <p>{schedule.tokenMintAddress.slice(0, 6)}...{schedule.tokenMintAddress.slice(-4)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                              <p>{parseInt(schedule.totalAmount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Progress</p>
                              <p>{calculateProgress(schedule)}%</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Milestones</p>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Threshold</TableHead>
                                  <TableHead>Percentage</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {formatMilestones(schedule).map((milestone: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>{milestone.threshold}</TableCell>
                                    <TableCell>{(milestone.unlockPercentage / 100).toFixed(2)}%</TableCell>
                                    <TableCell>
                                      {milestone.unlocked ? (
                                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                          Unlocked
                                        </span>
                                      ) : (
                                        <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                                          Locked
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Withdrawals</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Unlocked Amount</p>
                                <p className="text-lg font-medium">{calculateUnlockedAmount(schedule).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Unlocked Total</p>
                                <p className="text-lg font-medium">{parseInt(schedule.unlockedAmount).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleCheckMilestones(schedule.id)}
                          disabled={isCheckingMilestones}
                        >
                          {isCheckingMilestones && selectedVestingId === schedule.id ? (
                            <LoadingCircle size="small" />
                          ) : (
                            'Check Milestones'
                          )}
                        </Button>
                        <Button
                          onClick={() => handleWithdraw(schedule.id)}
                          disabled={
                            isWithdrawing || 
                            calculateUnlockedAmount(schedule) <= 0
                          }
                        >
                          {isWithdrawing && selectedVestingId === schedule.id ? (
                            <LoadingCircle size="small" />
                          ) : (
                            'Withdraw Unlocked'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Vesting Schedule</CardTitle>
                <CardDescription>
                  Set up a new token vesting schedule with social metric-based milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateVesting} className="grid gap-6">
                  <div className="grid gap-2">
                    <label htmlFor="recipient" className="text-sm font-medium">
                      Oracle Address
                    </label>
                    <Input
                      id="recipient"
                      placeholder="Oracle Address for Social Metrics"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This address will be used as the oracle that provides social metrics data
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="tokenMint" className="text-sm font-medium">
                      Token Mint Address
                    </label>
                    <Input
                      id="tokenMint"
                      placeholder="SPL Token Mint Address"
                      value={tokenMint}
                      onChange={(e) => setTokenMint(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="totalAmount" className="text-sm font-medium">
                      Total Amount
                    </label>
                    <Input
                      id="totalAmount"
                      type="number"
                      placeholder="Total Amount (in smallest units)"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left font-normal"
                          >
                            {startDate ? (
                              format(startDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date);
                              setStartDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left font-normal"
                          >
                            {endDate ? (
                              format(endDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => {
                              setEndDate(date);
                              setEndDateOpen(false);
                            }}
                            disabled={(date) => 
                              startDate ? date < startDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Milestones</label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Define milestone thresholds and percentage of tokens unlocked at each milestone
                    </p>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Milestone</TableHead>
                          <TableHead>Threshold</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {milestones.map((milestone, index) => (
                          <TableRow key={index}>
                            <TableCell>#{index + 1}</TableCell>
                            <TableCell>{milestone.threshold} followers</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="100"
                                max="10000"
                                step="100"
                                value={milestone.unlockPercentage / 100}
                                onChange={(e) => 
                                  handleMilestoneChange(index, parseInt(e.target.value) * 100)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-gray-400">
                      Note: Percentages are in basis points (1/100 of a percent). 10000 = 100%
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isCreatingVesting}
                  >
                    {isCreatingVesting ? (
                      <LoadingCircle size="small" />
                    ) : (
                      'Create Vesting Schedule'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default VestingDashboard; 
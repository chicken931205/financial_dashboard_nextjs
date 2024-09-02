"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useAppSelector } from '@/store/useStore';

interface Project {
  name: string;
  budget?: number;
  revenue?: number;
  labor?: number;
  overhead?: number;
  profit?: number;
  profitMargin?: number;
  hoursUsed?: number;
  budgetedHours?: number;
  mtdHours?: number;
  mtdCost?: number;
  quotedRate?: number;
  achievedRate?: number;
}

interface ProjectGroup {
  [key: string]: Project[];
}

interface WeeklyHoursData {
  week: number;
  Total?: number;
  'Fixed Fee'?: number;
  'T&M'?: number;
  [key: string]: number | string | undefined; // Allows dynamic keys
}

interface WeeklyHoursChartProps {
  projectName: string;
  isOverview?: boolean;
}

interface FinancialBarProps {
  project: Project;
  isMonthly: boolean;
}

interface ProjectCardProps {
  project: Project;
  isMonthly: boolean;
}

interface ClientOverviewCardProps {
  clientProjects: Project[];
  isMonthly: boolean;
}

interface FinancialOverviewProps {
  projects: Project[];
  isMonthly: boolean;
  projectType: 'overview' | 'fixed-fee' | 't&m' | 'tnm';
}

const fixedFeeProjects: Project[] = [
  { name: "TechGiant:Quantum Leap Animation", budget: 10000, revenue: 10000, labor: 870, overhead: 383, profit: 4247, profitMargin: 42, hoursUsed: 19, budgetedHours: 20, achievedRate: 515, quotedRate: 500, mtdHours: 8.9, mtdCost: 467 },
  { name: "TechGiant:NanoBot Assembly Line", budget: 17450, revenue: 17450, labor: 1283, overhead: 565, profit: 15602, profitMargin: 89, hoursUsed: 45, budgetedHours: 134, achievedRate: 392, quotedRate: 130, mtdHours: 44.5, mtdCost: 1283 },
  { name: "TechGiant:HoverCraft Prototype", budget: 17700, revenue: 17700, labor: 3597, overhead: 1582, profit: 12521, profitMargin: 71, hoursUsed: 115, budgetedHours: 136, achievedRate: 154, quotedRate: 130, mtdHours: 28.3, mtdCost: 841 },
  { name: "SoundWave:Holographic Speaker Design", budget: 12850, revenue: 12850, labor: 6141, overhead: 2703, profit: 4006, profitMargin: 31, hoursUsed: 141, budgetedHours: 111, achievedRate: 91, quotedRate: 116, mtdHours: 26.5, mtdCost: 1159 },
  { name: "EcoClean:Bio-Degradable Capsule Modeling", budget: 3955, revenue: 3955, labor: 1828, overhead: 804, profit: 1323, profitMargin: 33, hoursUsed: 44, budgetedHours: 34, achievedRate: 89, quotedRate: 116, mtdHours: 8.8, mtdCost: 373 },
  { name: "FutureLab:Quantum Computing UI Design", budget: 20000, revenue: 20000, labor: 8466, overhead: 3725, profit: 7809, profitMargin: 39, hoursUsed: 207, budgetedHours: 198, achievedRate: 97, quotedRate: 101, mtdHours: 2.2, mtdCost: 97 },
  { name: "AquaTech:Underwater Drone Concept", budget: 2070, revenue: 2070, labor: 337, overhead: 148, profit: 1585, profitMargin: 77, hoursUsed: 11, budgetedHours: 18, achievedRate: 197, quotedRate: 115, mtdHours: 10.5, mtdCost: 337 },
  { name: "AgriTech:Smart Tractor Interface", budget: 914400, revenue: 914400, labor: 32799, overhead: 14432, profit: 867169, profitMargin: 95, hoursUsed: 923, budgetedHours: 5225, achievedRate: 990, quotedRate: 175, mtdHours: 13.5, mtdCost: 539 },
  { name: "GreenEnergy:Solar Panel Efficiency Study", budget: 9000, revenue: 9000, labor: 17832, overhead: 7846, profit: -16678, profitMargin: -185, hoursUsed: 424, budgetedHours: 82, achievedRate: 21, quotedRate: 110, mtdHours: 0.5, mtdCost: 19 },
];

const tnmProjects: Project[] = [
  { name: "WaterWorks:Hydro-Electric Dam Visualization", budget: 78000, revenue: 58000, labor: 23198, overhead: 10207, profit: 24595, profitMargin: 42, hoursUsed: 387, budgetedHours: 520, achievedRate: 150, quotedRate: 150, mtdHours: 83.2, mtdCost: 4676 },
  { name: "WaterWorks:AI-Powered Water Treatment", budget: 31500, revenue: 31738, labor: 10875, overhead: 4785, profit: 16077, profitMargin: 51, hoursUsed: 212, budgetedHours: 210, achievedRate: 150, quotedRate: 150, mtdHours: 3.0, mtdCost: 147 },
  { name: "WaterWorks:Smart Faucet Design Language", budget: 22500, revenue: 23288, labor: 8490, overhead: 3736, profit: 11062, profitMargin: 48, hoursUsed: 155, budgetedHours: 150, achievedRate: 150, quotedRate: 150, mtdHours: 8.5, mtdCost: 490 },
  { name: "WaterWorks:Eco-Friendly Bathtub Accessories", budget: 142500, revenue: 152312, labor: 43132, overhead: 18978, profit: 90203, profitMargin: 59, hoursUsed: 1015, budgetedHours: 950, achievedRate: 150, quotedRate: 150, mtdHours: 322.8, mtdCost: 12977 },
  { name: "WaterWorks:Sustainable Plumbing Awards", budget: 75000, revenue: 37175, labor: 10035, overhead: 4415, profit: 22724, profitMargin: 61, hoursUsed: 248, budgetedHours: 500, achievedRate: 150, quotedRate: 150, mtdHours: 9.0, mtdCost: 309 },
  { name: "WaterWorks:3D-Printed Faucet Handles", budget: 12000, revenue: 10650, labor: 4943, overhead: 2175, profit: 3533, profitMargin: 33, hoursUsed: 71, budgetedHours: 80, achievedRate: 150, quotedRate: 150, mtdHours: 37.0, mtdCost: 2399 },
  { name: "WaterWorks:Water-Saving Fixture Strategy", budget: 30000, revenue: 22150, labor: 5238, overhead: 2305, profit: 14608, profitMargin: 66, hoursUsed: 148, budgetedHours: 200, achievedRate: 150, quotedRate: 150, mtdHours: 147.7, mtdCost: 5238 },
  { name: "WaterWorks:Smart Shower Research", budget: 18000, revenue: 13450, labor: 3037, overhead: 1336, profit: 9077, profitMargin: 67, hoursUsed: 90, budgetedHours: 120, achievedRate: 150, quotedRate: 150, mtdHours: 89.7, mtdCost: 3037 },
  { name: "WaterWorks:IoT Water Meter Collections", budget: 75000, revenue: 17100, labor: 6069, overhead: 2670, profit: 8361, profitMargin: 49, hoursUsed: 114, budgetedHours: 500, achievedRate: 150, quotedRate: 150, mtdHours: 20.0, mtdCost: 762 },
  { name: "WaterWorks:Smart Irrigation System", budget: 6000, revenue: 6900, labor: 1357, overhead: 597, profit: 4945, profitMargin: 72, hoursUsed: 46, budgetedHours: 40, achievedRate: 150, quotedRate: 150, mtdHours: 46.0, mtdCost: 1357 },
  { name: "WaterWorks:Aquarium Automation Concept", budget: 9000, revenue: 8063, labor: 3338, overhead: 1469, profit: 3256, profitMargin: 40, hoursUsed: 54, budgetedHours: 60, achievedRate: 150, quotedRate: 150, mtdHours: 30.3, mtdCost: 1855 },
  { name: "WaterWorks:Rainwater Harvesting System", budget: 22500, revenue: 9600, labor: 2444, overhead: 1075, profit: 6081, profitMargin: 63, hoursUsed: 64, budgetedHours: 150, achievedRate: 150, quotedRate: 150, mtdHours: 64.0, mtdCost: 2444 },
  { name: "WaterWorks:Smart Pool Management", budget: 22500, revenue: 8200, labor: 2820, overhead: 1241, profit: 4139, profitMargin: 50, hoursUsed: 55, budgetedHours: 150, achievedRate: 150, quotedRate: 150, mtdHours: 54.7, mtdCost: 2820 },
  { name: "WaterWorks:Water-Efficient Laundry Tech", budget: 44850, revenue: 14663, labor: 5969, overhead: 2626, profit: -8933, profitMargin: -61, hoursUsed: 98, budgetedHours: 299, achievedRate: 150, quotedRate: 150, mtdHours: 51.0, mtdCost: 3446 },
  { name: "WaterWorks:Oceanic Energy Converter", budget: 40500, revenue: 23625, labor: 6061, overhead: 2667, profit: 14897, profitMargin: 63, hoursUsed: 158, budgetedHours: 270, achievedRate: 150, quotedRate: 150, mtdHours: 74.5, mtdCost: 2860 },
  { name: "WaterWorks:Hydroponic System Design", budget: 24000, revenue: 18725, labor: 5886, overhead: 2590, profit: 10249, profitMargin: 55, hoursUsed: 125, budgetedHours: 160, achievedRate: 150, quotedRate: 150, mtdHours: 113.6, mtdCost: 5087 },
  { name: "EcoHomes:Smart Home Water Management", budget: 41600, revenue: 26673, labor: 19006, overhead: 8362, profit: -695, profitMargin: -3, hoursUsed: 333, budgetedHours: 520, achievedRate: 80, quotedRate: 80, mtdHours: 0.3, mtdCost: 18 },
  { name: "OfficeInnovate:Ergonomic Desk Design", budget: 15000, revenue: 28875, labor: 9069, overhead: 3990, profit: 15816, profitMargin: 55, hoursUsed: 250, budgetedHours: 130, achievedRate: 115, quotedRate: 115, mtdHours: 95.5, mtdCost: 3588 },
  { name: "OfficeInnovate:Smart Office Solutions", budget: 150000, revenue: 1840, labor: 422, overhead: 186, profit: 1233, profitMargin: 67, hoursUsed: 16, budgetedHours: 1304, achievedRate: 115, quotedRate: 115, mtdHours: 16.0, mtdCost: 422 },
];

const allProjects: Project[]  = [...fixedFeeProjects, ...tnmProjects];

const weeklyHoursData:WeeklyHoursData[] = [
  {
    week: 31,
    "TechGiant:Quantum Leap Animation": 1.6,
    "TechGiant:NanoBot Assembly Line": 0,
    "TechGiant:HoverCraft Prototype": 8.5,
    "SoundWave:Holographic Speaker Design": 13.9,
    "EcoClean:Bio-Degradable Capsule Modeling": 1.5,
    "FutureLab:Quantum Computing UI Design": 2.1,
    "AquaTech:Underwater Drone Concept": 0,
    "WaterWorks:Hydro-Electric Dam Visualization": 8.5,
    "WaterWorks:AI-Powered Water Treatment": 2,
    "WaterWorks:Smart Faucet Design Language": 0,
    "WaterWorks:Eco-Friendly Bathtub Accessories": 0,
    "WaterWorks:Sustainable Plumbing Awards": 0,
    "WaterWorks:3D-Printed Faucet Handles": 12,
    "WaterWorks:Water-Saving Fixture Strategy": 21.8,
    "WaterWorks:Smart Shower Research": 33,
    "WaterWorks:IoT Water Meter Collections": 1,
    "WaterWorks:Smart Irrigation System": 0,
    "WaterWorks:Aquarium Automation Concept": 9.5,
    "WaterWorks:Rainwater Harvesting System": 0,
    "WaterWorks:Smart Pool Management": 0,
    "WaterWorks:Water-Efficient Laundry Tech": 20,
    "WaterWorks:Oceanic Energy Converter": 13,
    "WaterWorks:Hydroponic System Design": 11.9,
    "AgriTech:Smart Tractor Interface": 3.3,
    "EcoHomes:Smart Home Water Management": 0,
    "OfficeInnovate:Smart Office Solutions": 0,
    "OfficeInnovate:Ergonomic Desk Design": 0,
    "GreenEnergy:Solar Panel Efficiency Study": 0,
    "Fixed Fee": 30.9,
    "T&M": 132.7,
    "Total": 163.6
  },
  {
    week: 32,
    "TechGiant:Quantum Leap Animation": 2.7,
    "TechGiant:NanoBot Assembly Line": 26.6,
    "TechGiant:HoverCraft Prototype": 14.4,
    "SoundWave:Holographic Speaker Design": 11.5,
    "EcoClean:Bio-Degradable Capsule Modeling": 7.3,
    "FutureLab:Quantum Computing UI Design": 0,
    "AquaTech:Underwater Drone Concept": 0,
    "WaterWorks:Hydro-Electric Dam Visualization": 23.5,
    "WaterWorks:AI-Powered Water Treatment": 1,
    "WaterWorks:Smart Faucet Design Language": 8.5,
    "WaterWorks:Eco-Friendly Bathtub Accessories": 105.3,
    "WaterWorks:Sustainable Plumbing Awards": 0,
    "WaterWorks:3D-Printed Faucet Handles": 14,
    "WaterWorks:Water-Saving Fixture Strategy": 63.4,
    "WaterWorks:Smart Shower Research": 39.1,
    "WaterWorks:IoT Water Meter Collections": 2.5,
    "WaterWorks:Smart Irrigation System": 18.5,
    "WaterWorks:Aquarium Automation Concept": 20.9,
    "WaterWorks:Rainwater Harvesting System": 0,
    "WaterWorks:Smart Pool Management": 0,
    "WaterWorks:Water-Efficient Laundry Tech": 11.1,
    "WaterWorks:Oceanic Energy Converter": 12.3,
    "WaterWorks:Hydroponic System Design": 48,
    "AgriTech:Smart Tractor Interface": 7.3,
    "EcoHomes:Smart Home Water Management": 0.3,
    "OfficeInnovate:Smart Office Solutions": 0,
    "OfficeInnovate:Ergonomic Desk Design": 0,
    "GreenEnergy:Solar Panel Efficiency Study": 0.5,
    "Fixed Fee": 70.3,
    "T&M": 368.4,
    "Total": 438.7
  },
  {
    week: 33,
    "TechGiant:Quantum Leap Animation": 1,
    "TechGiant:NanoBot Assembly Line": 18,
    "TechGiant:HoverCraft Prototype": 1.5,
    "SoundWave:Holographic Speaker Design": 1,
    "EcoClean:Bio-Degradable Capsule Modeling": 0,
    "FutureLab:Quantum Computing UI Design": 0,
    "AquaTech:Underwater Drone Concept": 1,
    "WaterWorks:Hydro-Electric Dam Visualization": 22.6,
    "WaterWorks:AI-Powered Water Treatment": 0,
    "WaterWorks:Smart Faucet Design Language": 0,
    "WaterWorks:Eco-Friendly Bathtub Accessories": 93.8,
    "WaterWorks:Sustainable Plumbing Awards": 9.1,
    "WaterWorks:3D-Printed Faucet Handles": 11,
    "WaterWorks:Water-Saving Fixture Strategy": 63,
    "WaterWorks:Smart Shower Research": 17.6,
    "WaterWorks:IoT Water Meter Collections": 15.5,
    "WaterWorks:Smart Irrigation System": 27.5,
    "WaterWorks:Aquarium Automation Concept": 0,
    "WaterWorks:Rainwater Harvesting System": 5,
    "WaterWorks:Smart Pool Management": 0,
    "WaterWorks:Water-Efficient Laundry Tech": 2.8,
    "WaterWorks:Oceanic Energy Converter": 45,
    "WaterWorks:Hydroponic System Design": 36.9,
    "AgriTech:Smart Tractor Interface": 3,
    "EcoHomes:Smart Home Water Management": 0,
    "OfficeInnovate:Smart Office Solutions": 0,
    "OfficeInnovate:Ergonomic Desk Design": 27.5,
    "GreenEnergy:Solar Panel Efficiency Study": 0,
    "Fixed Fee": 25.5,
    "T&M": 377.3,
    "Total": 402.8
  },
  {
    week: 34,
    "TechGiant:Quantum Leap Animation": 4,
    "TechGiant:NanoBot Assembly Line": 0,
    "TechGiant:HoverCraft Prototype": 4,
    "SoundWave:Holographic Speaker Design": 0.5,
    "EcoClean:Bio-Degradable Capsule Modeling": 0,
    "FutureLab:Quantum Computing UI Design": 0,
    "AquaTech:Underwater Drone Concept": 9.5,
    "WaterWorks:Hydro-Electric Dam Visualization": 28.8,
    "WaterWorks:AI-Powered Water Treatment": 0,
    "WaterWorks:Smart Faucet Design Language": 0,
    "WaterWorks:Eco-Friendly Bathtub Accessories": 123.9,
    "WaterWorks:Sustainable Plumbing Awards": 0,
    "WaterWorks:3D-Printed Faucet Handles": 0,
    "WaterWorks:Water-Saving Fixture Strategy": 0,
    "WaterWorks:Smart Shower Research": 0,
    "WaterWorks:IoT Water Meter Collections": 1,
    "WaterWorks:Smart Irrigation System": 0,
    "WaterWorks:Aquarium Automation Concept": 0,
    "WaterWorks:Rainwater Harvesting System": 59,
    "WaterWorks:Smart Pool Management": 54.8,
    "WaterWorks:Water-Efficient Laundry Tech": 17.4,
    "WaterWorks:Oceanic Energy Converter": 4.5,
    "WaterWorks:Hydroponic System Design": 17.1,
    "AgriTech:Smart Tractor Interface": 0,
    "EcoHomes:Smart Home Water Management": 0,
    "OfficeInnovate:Smart Office Solutions": 16,
    "OfficeInnovate:Ergonomic Desk Design": 68,
    "GreenEnergy:Solar Panel Efficiency Study": 0,
    "Fixed Fee": 18,
    "T&M": 390.5,
    "Total": 408.5
  }
];


const WeeklyHoursChart: React.FC<WeeklyHoursChartProps> = ({ projectName, isOverview = false }) => {
  const data = useMemo(() => {
    if (isOverview) {
      return weeklyHoursData.map(week => ({
        week: week.week,
        hours: week.Total
      }));
    } else if (projectName === "Fixed Fee Overview" || projectName === "T&M Overview") {
      const key = projectName === "Fixed Fee Overview" ? "Fixed Fee" : "T&M";
      return weeklyHoursData.map(week => ({
        week: week.week,
        hours: week[key]
      }));
    } else if (projectName.includes(':')) {
      // Individual project
      return weeklyHoursData.map(week => ({
        week: week.week,
        hours: (week as any)[projectName] || 0
      }));
    } else {
      // Client total
      return weeklyHoursData.map(week => ({
        week: week.week,
        hours: Object.entries(week)
          .filter(([key, value]) => key.startsWith(projectName) && typeof value === 'number')
          .reduce((sum, [, value]) => sum + Number(value), 0)
      }));
    }
  }, [projectName, isOverview]);

  const maxHours = Math.max(...data.map(d => d.hours));
  const yAxisTicks = [0, Math.ceil(maxHours / 2), Math.ceil(maxHours)];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
        <XAxis 
          dataKey="week" 
          tickLine={false} 
          axisLine={{ stroke: '#E5E7EB' }}
          tick={{ fontSize: 10, fill: '#6B7280' }}
          label={{ value: 'Week', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#4B5563' }}
        />
        <YAxis
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          tick={{ fontSize: 10, fill: '#6B7280' }}
          ticks={yAxisTicks}
          domain={[0, 'dataMax']}
          label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 5, fontSize: 12, fill: '#4B5563' }}
        />
        <RechartsTooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const value = payload[0]?.value;
              if (typeof value === 'number') {
                return (
                  <div className="bg-background border border-border rounded p-2 text-xs">
                    <p>Week {label}</p>
                    <p className="font-bold">{value.toFixed(2)} hours</p>
                  </div>
                );
              }
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3, fill: "#10b981" }}
          activeDot={{ r: 5, fill: "#059669" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const FinancialBar: React.FC<FinancialBarProps> = ({ project, isMonthly }) => {
  if (project.mtdCost && project.labor && project.overhead && project.revenue && project.budget) {
    const revenue = isMonthly ? (project.mtdCost / (project.labor + project.overhead)) * project.revenue : project.revenue;
    const labor = isMonthly ? (project.mtdCost / (project.labor + project.overhead)) * project.labor : project.labor;
    const overhead = isMonthly ? (project.mtdCost / (project.labor + project.overhead)) * project.overhead : project.overhead;
    let profit = isMonthly ? revenue - labor - overhead : project.profit;
  

    if (!profit) profit = 0;
    const total = labor + overhead + Math.abs(profit ?? 0);
    const laborWidth = (labor / total) * 100;
    const overheadWidth = (overhead / total) * 100;
    const profitWidth = (Math.abs(profit ?? 0) / total) * 100;
  
    
    return (
      <div className="relative h-6 w-full bg-gray-200 rounded-full overflow-hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 left-0 h-full bg-orange-500" style={{ width: `${laborWidth}%` }}></div>
            </TooltipTrigger>
            <TooltipContent>Labor: ${labor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 left-0 h-full bg-yellow-500" style={{ width: `${overheadWidth}%`, left: `${laborWidth}%` }}></div>
            </TooltipTrigger>
            <TooltipContent>Overhead: ${overhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`absolute top-0 right-0 h-full ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${profitWidth}%` }}></div>
            </TooltipTrigger>
            <TooltipContent>{profit >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="absolute top-0 left-0 h-full border-l border-gray-400" style={{ left: `${(project.budget / revenue) * 100}%` }}></div>
      </div>
    );
  }
  
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isMonthly }) => {
  const runway = (project.budgetedHours || 0) - (project.hoursUsed || 0);
  const isOverBudget = (project.revenue || 0) > (project.budget || 0);
  const isOverHours = (project.hoursUsed || 0) > (project.budgetedHours || 0);
  const isLowRunway = runway < 0.1 * (project.budgetedHours || 1);
  const isLoss = (project.profit || 0) < 0;

  let status = 'on-track';
  if (isLoss || isOverHours) status = 'danger';
  else if (isOverBudget || isLowRunway) status = 'warning';

  const displayedHours = isMonthly ? (project.mtdHours || 0) : (project.hoursUsed || 0);
  const displayedLabor = isMonthly ? ((project.mtdCost || 0) / ((project.labor || 0) + (project.overhead || 0))) * (project.labor || 0) : (project.labor || 0);
  const displayedOverhead = isMonthly ? ((project.mtdCost || 0) / ((project.labor || 0) + (project.overhead || 0))) * (project.overhead || 0) : (project.overhead || 0);
  const displayedProfit = isMonthly ? ((project.mtdCost || 0) / ((project.labor || 0) + (project.overhead || 0))) * (project.profit || 0) : (project.profit || 0);
  const displayedRevenue = isMonthly ? ((project.mtdCost || 0) / ((project.labor || 0) + (project.overhead || 0))) * (project.revenue || 0) : (project.revenue || 0);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium pr-2 flex-grow" style={{ minHeight: '2.5em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.name || 'Unnamed Project'}
          </CardTitle>
          <Badge variant={status === 'danger' ? 'destructive' : status === 'warning' ? 'outline' : 'default'} className="ml-2 whitespace-nowrap">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <WeeklyHoursChart projectName={project.name} isOverview={project.name === "Overall Financial Overview"} />
        <FinancialBar project={project} isMonthly={isMonthly} />
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">${(project.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labor:</span>
              <span className="font-medium">${displayedLabor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overhead:</span>
              <span className="font-medium">${displayedOverhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit/Loss:</span>
              <span className={`font-medium ${displayedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(displayedProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">${displayedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit Margin:</span>
              <span className="font-medium">{((project.profitMargin || 0).toFixed(2))}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hours:</span>
              <span className="font-medium">{displayedHours.toFixed(2)}/{isMonthly ? ((project.mtdHours || 0) / (project.hoursUsed || 1) * (project.budgetedHours || 0)).toFixed(2) : (project.budgetedHours || 0).toFixed(2)}</span>
            </div>
            <div>
              <Progress value={(displayedHours / (isMonthly ? ((project.mtdHours || 0) / (project.hoursUsed || 1)) * (project.budgetedHours || 1) : (project.budgetedHours || 1))) * 100} className="h-2" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
          <div>Quoted Rate: ${(project.quotedRate || 0).toFixed(2)}/hr</div>
          <div>Achieved Rate: ${(project.achievedRate || 0).toFixed(2)}/hr</div>
        </div>
      </CardContent>
    </Card>
  );
};

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ projects, isMonthly, projectType }) => {
  const totalB = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalR = isMonthly 
    ? projects.reduce((sum, p) => sum + ((p.mtdCost || 0) / ((p.labor || 0) + (p.overhead || 0))) * (p.revenue || 0), 0)
    : projects.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalL = isMonthly
    ? projects.reduce((sum, p) => sum + ((p.mtdCost || 0) / ((p.labor || 0) + (p.overhead || 0))) * (p.labor || 0), 0)
    : projects.reduce((sum, p) => sum + (p.labor || 0), 0);
  const totalO = isMonthly
    ? projects.reduce((sum, p) => sum + ((p.mtdCost || 0) / ((p.labor || 0) + (p.overhead || 0))) * (p.overhead || 0), 0)
    : projects.reduce((sum, p) => sum + (p.overhead || 0), 0);
  const totalP = totalR - totalL - totalO;
  const totalBH = projects.reduce((sum, p) => sum + (p.budgetedHours || 0), 0);
  const totalHU = isMonthly
    ? projects.reduce((sum, p) => sum + (p.mtdHours || 0), 0)
    : projects.reduce((sum, p) => sum + (p.hoursUsed || 0), 0);
  const avgQR = projects.reduce((sum, p) => sum + (p.quotedRate || 0), 0) / projects.length;
  const avgAR = projects.reduce((sum, p) => sum + (p.achievedRate || 0), 0) / projects.length;

  const overviewProject = {
    name: projectType === "overview" ? "Overall Financial Overview" : 
          projectType === "fixed-fee" ? "Fixed Fee Overview" : "T&M Overview",
    budget: totalB,
    revenue: totalR,
    labor: totalL,
    overhead: totalO,
    profit: totalP,
    budgetedHours: totalBH,
    hoursUsed: totalHU,
    quotedRate: avgQR,
    achievedRate: avgAR,
    profitMargin: (totalP / totalR) * 100,
    mtdCost: totalL + totalO
  };

  return <ProjectCard project={overviewProject} isMonthly={isMonthly} />;
};

const ClientOverviewCard: React.FC<ClientOverviewCardProps> = ({ clientProjects, isMonthly }) => {
  // Get the client name from the first project
  const clientName = clientProjects[0].name.split(':')[0];

  // Initialize the combined project object with default values
  const combinedProject = clientProjects.reduce((acc, project) => {
    acc.budget = (acc.budget ?? 0) +  (project.budget ?? 0);
    acc.revenue = (acc.revenue ?? 0) + (project.revenue ?? 0);
    acc.labor = (acc.labor ?? 0) + (project.labor ?? 0);
    acc.overhead = (acc.overhead ?? 0) + (project.overhead ?? 0);
    acc.profit = (acc.profit ?? 0) + (project.profit ?? 0);
    acc.hoursUsed = (acc.hoursUsed ?? 0) + (project.hoursUsed ?? 0);
    acc.budgetedHours = (acc.budgetedHours ?? 0) + (project.budgetedHours ?? 0);
    acc.mtdHours = (acc.mtdHours ?? 0) + (project.mtdHours ?? 0);
    acc.mtdCost = (acc.mtdCost ?? 0) + (project.mtdCost ?? 0);
    return acc;
  }, {
    name: clientName,
    budget: 0,
    revenue: 0,
    labor: 0,
    overhead: 0,
    profit: 0,
    hoursUsed: 0,
    budgetedHours: 0,
    mtdHours: 0,
    mtdCost: 0,
    quotedRate: clientProjects[0].quotedRate ?? 0,
    achievedRate: clientProjects.reduce((sum, p) => sum + (p.achievedRate ?? 0), 0) / clientProjects.length,
  });

  // Calculate profit margin
  if (combinedProject.revenue) {
    combinedProject.profitMargin = combinedProject.revenue > 0 ? ((combinedProject.profit ?? 0) / combinedProject.revenue) * 100 : 0;
  }

  return <ProjectCard project={combinedProject} isMonthly={isMonthly} />;
};
export default function Component() {
  const router = useRouter()
  const [isMonthly, setIsMonthly] = useState(false);
  const isLogin = useAppSelector((state) => state.app.isLogin);
  
  useEffect(() => {
    if (!isLogin) {
      router.push('/login');
    } 
  }, []);

  const clientProjects = useMemo(() => {
    const groupedProjects: ProjectGroup = allProjects.reduce((acc: ProjectGroup, project: Project) => {
      const clientName = project.name.split(':')[0];
      if (!acc[clientName]) {
        acc[clientName] = [];
      }
      acc[clientName].push(project);
      return acc;
    }, {});
    return Object.values(groupedProjects);
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Financial Health Dashboard - August 2024</h1>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch id="monthly-toggle" checked={isMonthly} onCheckedChange={setIsMonthly} />
        <Label htmlFor="monthly-toggle">Show Monthly Data</Label>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fixed-fee">Fixed Fee</TabsTrigger>
          <TabsTrigger value="tnm">T&M</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <FinancialOverview projects={allProjects} isMonthly={isMonthly} projectType="overview" />
          <h2 className="text-2xl font-semibold mb-4 mt-6">Client Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientProjects.map((projects, index) => (
              <ClientOverviewCard key={index} clientProjects={projects} isMonthly={isMonthly} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="fixed-fee">
          <FinancialOverview projects={fixedFeeProjects} isMonthly={isMonthly} projectType="fixed-fee" />
          <h2 className="text-2xl font-semibold mb-4 mt-6">Fixed Fee Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fixedFeeProjects.map(project => (
              <ProjectCard key={project.name} project={project} isMonthly={isMonthly} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="tnm">
          <FinancialOverview projects={tnmProjects} isMonthly={isMonthly} projectType="tnm" />
          <h2 className="text-2xl font-semibold mb-4 mt-6">T&M Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tnmProjects.map(project => (
              <ProjectCard key={project.name} project={project} isMonthly={isMonthly} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { HealthDataWithPrediction } from "@shared/schema";

export default function HealthTrends() {
  const { data: healthData, isLoading } = useQuery<HealthDataWithPrediction[]>({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!healthData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No health data available yet. Complete your health assessment to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const processedData = healthData.map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString(),
    bloodSugar: entry.physiological.bloodSugar,
    systolic: entry.physiological.bloodPressure.systolic,
    diastolic: entry.physiological.bloodPressure.diastolic,
    riskScore: entry.prediction?.score || 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bloodSugar" 
                stroke="#8884d8" 
                name="Blood Sugar"
              />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#82ca9d" 
                name="Blood Pressure (Systolic)"
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#ffc658" 
                name="Blood Pressure (Diastolic)"
              />
              <Line 
                type="monotone" 
                dataKey="riskScore" 
                stroke="#ff7300" 
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
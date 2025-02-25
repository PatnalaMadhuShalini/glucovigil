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

export default function HealthTrends() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Process data for charts
  const processedData = healthData?.map((entry: any) => ({
    date: new Date(entry.createdAt).toLocaleDateString(),
    bloodSugar: entry.physiological.bloodSugar,
    systolic: entry.physiological.bloodPressure.systolic,
    diastolic: entry.physiological.bloodPressure.diastolic,
    riskScore: entry.prediction.score
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
                dataKey="riskScore" 
                stroke="#82ca9d" 
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

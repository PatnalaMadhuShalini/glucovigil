import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HealthForm from "@/components/health-form";
import RiskDisplay from "@/components/risk-display";
import Recommendations from "@/components/recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: healthData, isLoading } = useQuery({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}
          </h1>
          <p className="text-gray-600">Monitor your health and get personalized insights</p>
        </div>

        {!showForm && !healthData?.length && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="mb-4">Start by completing your health assessment</p>
              <Button onClick={() => setShowForm(true)}>
                Take Health Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <HealthForm onComplete={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {healthData?.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            <RiskDisplay data={healthData[healthData.length - 1]} />
            <Recommendations data={healthData[healthData.length - 1]} />
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavMenu from "@/components/nav-menu";
import HealthForm from "@/components/health-form";
import RiskDisplay from "@/components/risk-display";
import Recommendations from "@/components/recommendations";
import HealthTrends from "@/components/health-trends";
import HealthRecommendations from "@/components/health-recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HealthDataWithPrediction } from "@shared/schema";
import Achievements from "@/components/achievements";
import FeedbackSystem from "@/components/feedback-system";

export default function Dashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: healthData, isLoading } = useQuery<HealthDataWithPrediction[]>({
    queryKey: ["/api/health-data"],
    select: (data) => data || [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const latestData = healthData?.length ? healthData[healthData.length - 1] : undefined;
  const showRiskAlert = latestData?.prediction?.level === "high";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <NavMenu />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}
            </h1>
            <p className="text-gray-600">Monitor your health and get personalized insights</p>
          </div>

          {showRiskAlert && (
            <Alert className="mb-8 border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">
                Your latest health assessment indicates a high risk level. Please review your recommendations and consider consulting a healthcare professional.
              </AlertDescription>
            </Alert>
          )}

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
            <>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <RiskDisplay data={latestData} />
                <Recommendations data={latestData} />
              </div>

              <div className="mb-8">
                <HealthTrends data={healthData} />
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-8">
                  <HealthRecommendations healthData={latestData} />
                  <FeedbackSystem />
                </div>
                <Achievements achievements={latestData?.achievements || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
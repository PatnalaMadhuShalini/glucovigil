import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavMenu from "@/components/nav-menu";
import HealthForm from "@/components/health-form";
import RiskDisplay from "@/components/risk-display";
import Recommendations from "@/components/recommendations";
import HealthTrends from "@/components/health-trends";
import HealthRecommendations from "@/components/health-recommendations";
import SymptomWizard from "@/components/symptom-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ActivitySquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HealthDataWithPrediction } from "@shared/schema";
import Achievements from "@/components/achievements";
import FeedbackSystem from "@/components/feedback-system";

export default function Dashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showSymptomWizard, setShowSymptomWizard] = useState(false);

  const { data: healthData, isLoading } = useQuery<HealthDataWithPrediction[]>({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-teal-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const latestData = healthData?.[healthData.length - 1];
  const showRiskAlert = latestData?.prediction?.level === "high";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-teal-50">
      <NavMenu />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
              Welcome back, {user?.username}
            </h1>
            <p className="text-gray-600 text-lg">Monitor your health and get personalized insights</p>
          </div>

          {showRiskAlert && (
            <Alert className="mb-8 border-2 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 font-medium">
                Your latest health assessment indicates a high risk level. Please review your recommendations and consider consulting a healthcare professional.
              </AlertDescription>
            </Alert>
          )}

          {!showForm && !healthData?.length && (
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
              <CardContent className="p-8 text-center">
                <p className="mb-4 text-lg text-gray-700">Start by completing your health assessment</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                >
                  Take Health Assessment
                </Button>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
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
                <HealthTrends />
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-8">
                  <HealthRecommendations healthData={latestData} />
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Symptom Tracking</h2>
                        <Button
                          onClick={() => setShowSymptomWizard(true)}
                          className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 flex items-center gap-2"
                        >
                          <ActivitySquare className="h-4 w-4" />
                          Track Symptoms
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Use our intuitive wizard to track your symptoms and get personalized insights.
                      </p>
                    </CardContent>
                  </Card>
                  <FeedbackSystem />
                </div>
                <Achievements achievements={latestData?.achievements || []} />
              </div>
            </>
          )}

          {showSymptomWizard && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto m-4 bg-white/95">
                <CardContent className="p-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSymptomWizard(false)}
                      className="border-2 border-blue-100"
                    >
                      Close
                    </Button>
                  </div>
                  <SymptomWizard onComplete={() => setShowSymptomWizard(false)} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
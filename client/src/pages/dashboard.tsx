import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HealthForm from "@/components/health-form";
import RiskDisplay from "@/components/risk-display";
import Recommendations from "@/components/recommendations";
import HealthTrends from "@/components/health-trends";
import HealthRecommendations from "@/components/health-recommendations";
import SymptomWizard from "@/components/symptom-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ActivitySquare, Sparkles } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#0A192F]">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-300" />
          <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full blur-xl" />
        </div>
      </div>
    );
  }

  const latestData = healthData?.[healthData.length - 1];
  const showRiskAlert = latestData?.prediction?.level === "high";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A192F]">
      <div className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">
                Welcome back, {user?.username}
              </h1>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-blue-100/80 text-lg">
              Monitor your health and get personalized insights
            </p>
          </div>

          {showRiskAlert && (
            <Alert className="mb-8 border-2 border-red-300/50 bg-red-900/30 backdrop-blur-lg">
              <AlertDescription className="text-red-200 font-medium">
                Your latest health assessment indicates a high risk level. Please review your recommendations and consider consulting a healthcare professional.
              </AlertDescription>
            </Alert>
          )}

          {!showForm && !healthData?.length && (
            <Card className="mb-8 bg-white/5 backdrop-blur-lg border border-white/10">
              <CardContent className="p-8 text-center">
                <p className="mb-6 text-xl text-blue-100">Start by completing your health assessment</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <span className="relative z-10">Take Health Assessment</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="mb-8 bg-white/5 backdrop-blur-lg border border-white/10">
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
                  <Card className="bg-white/5 backdrop-blur-lg border border-white/10 group hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Symptom Tracking</h2>
                        <Button
                          onClick={() => setShowSymptomWizard(true)}
                          className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2"
                        >
                          <ActivitySquare className="h-4 w-4" />
                          <span className="relative z-10">Track Symptoms</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                      </div>
                      <p className="text-sm text-blue-100/70">
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto m-4 bg-white/95 border-2 border-white/30">
                <CardContent className="p-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSymptomWizard(false)}
                      className="border-2 border-indigo-200/30 hover:bg-indigo-100/10"
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
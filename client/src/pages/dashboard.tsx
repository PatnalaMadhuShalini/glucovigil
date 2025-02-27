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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-100">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
          <div className="absolute inset-0 animate-pulse bg-sky-300/20 rounded-full blur-xl" />
        </div>
      </div>
    );
  }

  const latestData = healthData?.[healthData.length - 1];
  const showRiskAlert = latestData?.prediction?.level === "high";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-200">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-indigo-500/10 animate-gradient-xy" />

      <div className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-800">
                Welcome back, {user?.username}
              </h1>
              <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </div>
            <p className="text-gray-600 text-lg">
              Monitor your health and get personalized insights
            </p>
          </div>

          {showRiskAlert && (
            <Alert className="mb-8 border-2 border-red-300 bg-red-50 shadow-md">
              <AlertDescription className="text-red-700 font-medium">
                Your latest health assessment indicates a high risk level. Please review your recommendations and consider consulting a healthcare professional.
              </AlertDescription>
            </Alert>
          )}

          {!showForm && !healthData?.length && (
            <Card className="mb-8 bg-white shadow-xl border-2 border-sky-100">
              <CardContent className="p-8 text-center">
                <p className="mb-6 text-xl text-gray-700">Start by completing your health assessment</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="relative overflow-hidden group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-6 py-3 text-lg"
                >
                  <span className="relative z-10">Take Health Assessment</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="mb-8 bg-white shadow-xl border border-sky-100">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Health Assessment Form</h2>
                <div className="bg-sky-50 p-6 rounded-lg">
                  <HealthForm onComplete={() => setShowForm(false)} />
                </div>
              </CardContent>
            </Card>
          )}

          {healthData && healthData.length > 0 && (
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
                  <Card className="bg-white shadow-lg border border-sky-100 group hover:bg-sky-50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Symptom Tracking</h2>
                        <Button
                          onClick={() => setShowSymptomWizard(true)}
                          className="relative overflow-hidden group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 flex items-center gap-2"
                        >
                          <ActivitySquare className="h-4 w-4" />
                          <span className="relative z-10">Track Symptoms</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto m-4 bg-white border-2 border-sky-100">
                <CardContent className="p-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSymptomWizard(false)}
                      className="border-2 border-sky-200 hover:bg-sky-50"
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
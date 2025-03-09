import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import RiskDisplay from "@/components/risk-display";
import HealthRecommendations from "@/components/health-recommendations";
import { Activity } from "lucide-react";

export default function Analysis() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-sky-600" />
            <CardTitle className="text-2xl">Your Health Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            View your personalized health risk assessment and recommendations based on your profile data.
          </p>
          <RiskDisplay />
          <div className="mt-8">
            <HealthRecommendations />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

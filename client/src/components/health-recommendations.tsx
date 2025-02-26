import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import type { HealthDataWithPrediction } from "@shared/schema";

interface HealthRecommendationsProps {
  healthData?: HealthDataWithPrediction;
}

export default function HealthRecommendations({ healthData }: HealthRecommendationsProps) {
  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No health data available. Complete your health assessment to see recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = healthData.prediction?.level || "low";
  const riskScore = healthData.prediction?.score || 0;

  const getRiskColor = () => {
    switch (riskLevel) {
      case "high":
        return "text-red-500";
      case "moderate":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Risk Level</h3>
            <div className={`text-2xl font-bold capitalize ${getRiskColor()}`}>
              {riskLevel}
            </div>
            <Progress value={riskScore * 10} className="mt-2" />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Recommendations</h3>
            {healthData.prediction?.recommendations?.length ? (
              <ul className="list-disc pl-4 space-y-1">
                {healthData.prediction.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm">{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete your health assessment to receive personalized recommendations.
              </p>
            )}
          </div>

          <Alert>
            <AlertDescription>
              Keep tracking your health metrics regularly for better insights.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
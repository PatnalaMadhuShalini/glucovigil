import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { HealthDataWithPrediction } from "@shared/schema";

interface RiskDisplayProps {
  data?: HealthDataWithPrediction;
}

export default function RiskDisplay({ data }: RiskDisplayProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No risk assessment data available.</p>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = data.prediction?.level || "low";
  const riskScore = data.prediction?.score || 0;

  const riskColor = riskLevel === "high" 
    ? "bg-red-500" 
    : riskLevel === "moderate" 
    ? "bg-yellow-500" 
    : "bg-green-500";

  const riskPercent = (riskScore / 5) * 100;

  const getStressColor = (level?: string) => {
    switch(level?.toLowerCase()) {
      case 'severe': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Diabetes Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Risk Level:</span>
          <span className={`px-3 py-1 rounded-full text-white capitalize ${riskColor}`}>
            {riskLevel}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Risk Score</span>
            <span>{riskScore}/5</span>
          </div>
          <Progress value={riskPercent} className={riskColor} />
        </div>

        <div className="mt-4 pt-4 border-t">
          <h3 className="font-medium mb-3">Key Risk Factors:</h3>
          <div className="space-y-2 text-sm">
            {/* Stress Level - Now prominently displayed at the top */}
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Stress Level:</span>
                <span className={`font-medium ${getStressColor(data.mentalHealth?.stressLevel)}`}>
                  {data.mentalHealth?.stressLevel ? (
                    data.mentalHealth.stressLevel.charAt(0).toUpperCase() + 
                    data.mentalHealth.stressLevel.slice(1)
                  ) : 'Low'}
                </span>
              </div>
            </div>

            {/* Other key factors */}
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Blood Sugar:</span>
                <span>{data.physiological.bloodSugar} mg/dL</span>
              </div>
              <div className="flex justify-between">
                <span>BMI:</span>
                <span>{(data.physiological.weight / Math.pow(data.physiological.height/100, 2)).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Exercise Level:</span>
                <span className="capitalize">{data.lifestyle.exercise}</span>
              </div>
              <div className="flex justify-between">
                <span>Diet Quality:</span>
                <span className="capitalize">{data.lifestyle.diet}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
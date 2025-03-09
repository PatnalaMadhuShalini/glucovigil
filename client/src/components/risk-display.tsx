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

  // Calculate BMI
  const bmi = (data.physiological.weight / Math.pow(data.physiological.height/100, 2)).toFixed(1);

  // Helper function to format boolean values
  const formatBoolean = (value: boolean) => value ? "Yes" : "No";

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
          <h3 className="font-medium mb-3">Key Health Factors:</h3>
          <div className="space-y-4">
            {/* Physiological Measurements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Physical Measurements</h4>
              <ul className="text-sm space-y-1">
                <li>Blood Sugar: {data.physiological.bloodSugar} mg/dL</li>
                <li>BMI: {bmi}</li>
                <li>Blood Pressure: {data.physiological.bloodPressure.systolic}/{data.physiological.bloodPressure.diastolic} mmHg</li>
                <li>Waist Circumference: {data.physiological.waistCircumference} cm</li>
              </ul>
            </div>

            {/* Medical History */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Medical History</h4>
              <ul className="text-sm space-y-1">
                <li>Prior Prediabetes: {formatBoolean(data.physiological.priorPrediabetes)}</li>
                <li>Heart Disease: {formatBoolean(data.physiological.heartDisease)}</li>
              </ul>
            </div>

            {/* Lifestyle Factors */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Lifestyle</h4>
              <ul className="text-sm space-y-1">
                <li>Exercise: {data.lifestyle.exercise.frequency} ({data.lifestyle.exercise.minutesPerWeek} min/week)</li>
                <li>Diet Quality: {data.lifestyle.diet.quality}</li>
                <li>Daily Fruits & Vegetables: {data.lifestyle.diet.fruitsVegetables} servings</li>
                <li>Processed Foods: {data.lifestyle.diet.processedFoods} servings</li>
                <li>Sugary Drinks: {data.lifestyle.diet.sugaryDrinks} servings</li>
                <li>Stress Level: {data.lifestyle.stressLevel}</li>
                <li>Sleep: {data.lifestyle.sleep?.hoursPerNight || 0} hours/night ({data.lifestyle.sleep?.quality || 'unknown'})</li>
                <li>Work Style: {data.lifestyle.workStyle}</li>
              </ul>
            </div>

            {/* Family History */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Family History</h4>
              <ul className="text-sm space-y-1">
                <li>Parents with Diabetes: {formatBoolean(data.demographics.familyHistory.parents)}</li>
                <li>Siblings with Diabetes: {formatBoolean(data.demographics.familyHistory.siblings)}</li>
                <li>Children with Diabetes: {formatBoolean(data.demographics.familyHistory.children)}</li>
              </ul>
            </div>

            {/* Substance Use */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Substance Use</h4>
              <ul className="text-sm space-y-1">
                <li>Smoking: {formatBoolean(data.lifestyle.smoking)}</li>
                <li>Alcohol: {data.lifestyle.alcohol.frequency} ({data.lifestyle.alcohol.drinksPerWeek} drinks/week)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
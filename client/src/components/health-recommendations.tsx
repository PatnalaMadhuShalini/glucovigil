import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Utensils, Dumbbell } from "lucide-react";

interface HealthRecommendationsProps {
  healthData: {
    physiological: {
      weight: number;
      height: number;
      bloodSugar: number;
    };
    demographics: {
      gender: string;
    };
    lifestyle: {
      exercise: string;
    };
    prediction: {
      level: string;
    };
  };
}

export default function HealthRecommendations({ healthData }: HealthRecommendationsProps) {
  const [activeTab, setActiveTab] = useState('nutrition');

  const nutritionPlan = generateNutritionPlan();
  const exercisePlan = generateExercisePlan();

  function generateNutritionPlan() {
    const bmi = healthData.physiological.weight / Math.pow(healthData.physiological.height/100, 2);
    const baseCalories = healthData.demographics.gender === 'male' ? 2500 : 2000;
    const adjustedCalories = bmi > 25 ? baseCalories * 0.8 : baseCalories;

    return {
      calories: Math.round(adjustedCalories),
      macros: {
        protein: Math.round(adjustedCalories * 0.3 / 4),
        carbs: Math.round(adjustedCalories * 0.4 / 4),
        fats: Math.round(adjustedCalories * 0.3 / 9)
      },
      recommendations: [
        "Increase protein intake for better blood sugar control",
        "Include more fiber-rich foods",
        "Limit processed carbohydrates",
        healthData.physiological.bloodSugar > 120 ? "Monitor carbohydrate intake carefully" : null
      ].filter(Boolean)
    };
  }

  function generateExercisePlan() {
    const intensity = healthData.lifestyle.exercise;
    const riskLevel = healthData.prediction.level;

    const basePlan = {
      cardio: intensity === 'none' ? 15 : intensity === 'light' ? 20 : 30,
      strength: intensity === 'none' ? 10 : intensity === 'light' ? 15 : 20,
      flexibility: 10
    };

    return {
      minutes: basePlan,
      recommendations: [
        `Start with ${basePlan.cardio} minutes of cardio ${intensity === 'none' ? 'walking' : 'exercise'}`,
        `Include ${basePlan.strength} minutes of strength training`,
        `Add ${basePlan.flexibility} minutes of stretching for flexibility`,
        riskLevel === 'high' ? 'Consider working with a fitness professional' : null
      ].filter(Boolean)
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Personalized Health Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition">
              <Utensils className="h-4 w-4 mr-2" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="exercise">
              <Dumbbell className="h-4 w-4 mr-2" />
              Exercise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Daily Calories: {nutritionPlan.calories}</h3>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="font-medium">{nutritionPlan.macros.protein}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="font-medium">{nutritionPlan.macros.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fats</p>
                    <p className="font-medium">{nutritionPlan.macros.fats}g</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="list-disc pl-4 space-y-1">
                  {nutritionPlan.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exercise" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Daily Exercise Plan</h3>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cardio</p>
                    <p className="font-medium">{exercisePlan.minutes.cardio} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Strength</p>
                    <p className="font-medium">{exercisePlan.minutes.strength} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flexibility</p>
                    <p className="font-medium">{exercisePlan.minutes.flexibility} min</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="list-disc pl-4 space-y-1">
                  {exercisePlan.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            These recommendations are based on your health assessment data. For personalized medical advice, please consult with a healthcare professional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
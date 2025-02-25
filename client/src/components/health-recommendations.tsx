import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Utensils, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import type { NutritionPlan, ExercisePlan } from "@shared/schema";

interface HealthRecommendationsProps {
  nutritionPlan?: NutritionPlan;
  exercisePlan?: ExercisePlan;
}

export default function HealthRecommendations({ nutritionPlan, exercisePlan }: HealthRecommendationsProps) {
  const [selectedTab, setSelectedTab] = useState("nutrition");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Personalized Health Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
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

          <TabsContent value="nutrition">
            {nutritionPlan ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-semibold mb-2">Daily Meal Plan</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Breakfast</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {nutritionPlan.mealPlan.breakfast.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Lunch</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {nutritionPlan.mealPlan.lunch.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="font-semibold mb-2">Nutritional Goals</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{nutritionPlan.calories}</p>
                      <p className="text-sm text-gray-600">Daily Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{nutritionPlan.macros.protein}g</p>
                      <p className="text-sm text-gray-600">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{nutritionPlan.macros.carbs}g</p>
                      <p className="text-sm text-gray-600">Carbs</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                Complete your health assessment to get personalized nutrition recommendations.
              </p>
            )}
          </TabsContent>

          <TabsContent value="exercise">
            {exercisePlan ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-semibold mb-2">Weekly Exercise Plan</h3>
                  <div className="space-y-4">
                    {Object.entries(exercisePlan.weeklyPlan).map(([day, exercises]) => (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium capitalize mb-2">{day}</h4>
                        <ul className="space-y-2">
                          {exercises.map((exercise, i) => (
                            <li key={i} className="text-sm text-gray-600">
                              {exercise.type} - {exercise.duration} mins ({exercise.intensity})
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="font-semibold mb-2">Exercise Goals</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{exercisePlan.goals.steps}</p>
                      <p className="text-sm text-gray-600">Daily Steps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{exercisePlan.goals.duration}min</p>
                      <p className="text-sm text-gray-600">Activity Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{exercisePlan.goals.intensity}</p>
                      <p className="text-sm text-gray-600">Intensity</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                Complete your health assessment to get personalized exercise recommendations.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Dumbbell, Utensils } from "lucide-react";

export default function HealthRecommendations({ healthData }: { healthData: any }) {
  const [activeTab, setActiveTab] = useState('nutrition');
  
  const generateNutritionPlan = () => {
    const bmi = healthData.physiological.weight / Math.pow(healthData.physiological.height/100, 2);
    const baseCalories = healthData.demographics.gender === 'male' ? 2500 : 2000;
    const adjustedCalories = bmi > 25 ? baseCalories * 0.8 : baseCalories;

    return {
      calories: adjustedCalories,
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
  };

  const generateExercisePlan = () => {
    const intensity = healthData.lifestyle.exercise;
    const riskLevel = healthData.prediction.level;
    
    const basePlan = {
      cardio: intensity === 'none' ? 15 : intensity === 'light' ? 20 : 30,
      strength: intensity === 'none' ? 10 : intensity === 'light' ? 15 : 20,
      flexibility: 10
    };

    return {
      weeklyGoal: {
        minutes: Object.values(basePlan).reduce((a, b) => a + b, 0) * 3,
        sessions: 3
      },
      recommendations: [
        riskLevel === 'high' ? "Start with low-impact exercises" : "Mix cardio and strength training",
        "Gradually increase intensity",
        "Include rest days between workouts"
      ]
    };
  };

  const nutritionPlan = generateNutritionPlan();
  const exercisePlan = generateExercisePlan();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personalized Health Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition">
              <Utensils className="mr-2 h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="exercise">
              <Dumbbell className="mr-2 h-4 w-4" />
              Exercise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">Daily Targets</h3>
              <p className="text-2xl font-bold">{nutritionPlan.calories} kcal</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span>{nutritionPlan.macros.protein}g</span>
                </div>
                <Progress value={30} className="bg-blue-200" />
                <div className="flex justify-between">
                  <span>Carbs</span>
                  <span>{nutritionPlan.macros.carbs}g</span>
                </div>
                <Progress value={40} className="bg-green-200" />
                <div className="flex justify-between">
                  <span>Fats</span>
                  <span>{nutritionPlan.macros.fats}g</span>
                </div>
                <Progress value={30} className="bg-yellow-200" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recommendations</h3>
              <ul className="space-y-2">
                {nutritionPlan.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="exercise" className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">Weekly Goals</h3>
              <p className="text-2xl font-bold">{exercisePlan.weeklyGoal.minutes} minutes</p>
              <p className="text-sm text-muted-foreground">
                {exercisePlan.weeklyGoal.sessions} sessions per week
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recommendations</h3>
              <ul className="space-y-2">
                {exercisePlan.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

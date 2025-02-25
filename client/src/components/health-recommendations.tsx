import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Utensils, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import type { NutritionPlan, ExercisePlan, HealthDataWithPrediction } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as tf from '@tensorflow/tfjs';


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

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { HealthDataWithPrediction } from "@shared/schema";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Download, Bell } from "lucide-react";
import * as tf from '@tensorflow/tfjs';

export default function HealthRecommendations({ healthData }: { healthData: HealthDataWithPrediction }) {
  const [feedback, setFeedback] = useState("");
  const [mlRisk, setMlRisk] = useState(0);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Load TensorFlow model
  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel('/models/diabetes_risk.json');
        setModel(loadedModel);
      } catch (err) {
        console.error("Error loading model:", err);
      }
    }
    loadModel();
  }, []);

  // ML-based risk assessment
  const assessRisk = async () => {
    if (!model || !healthData) return;

    const input = tf.tensor2d([[
      healthData.bloodSugar || 0,
      healthData.bloodPressure?.systolic || 0,
      healthData.weight || 0,
      healthData.age || 0,
    ]]);

    const prediction = model.predict(input) as tf.Tensor;
    const risk = (await prediction.data())[0];
    setMlRisk(risk);
    input.dispose();
    prediction.dispose();
  };

  // Submit feedback
  const feedbackMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rating: 5, 
          comment: feedback,
          healthData: healthData.id
        })
      });
      if (!response.ok) throw new Error("Failed to submit feedback");
      return response.json();
    }
  });

  const riskLevel = mlRisk > 0.7 ? "High" : mlRisk > 0.4 ? "Medium" : "Low";
  const riskColor = riskLevel === "High" ? "red" : riskLevel === "Medium" ? "yellow" : "green";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Risk Assessment & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Instant Risk Assessment</h3>
          <Progress value={mlRisk * 100} className={`bg-${riskColor}-100`} />
          <p>Risk Level: <span className={`font-bold text-${riskColor}-500`}>{riskLevel}</span></p>
          <Button onClick={assessRisk} className="mt-2">Calculate Risk</Button>
        </div>

        {riskLevel === "High" && (
          <Alert className="bg-red-50 border-red-200">
            <Bell className="h-4 w-4 text-red-500" />
            <AlertDescription>
              High risk detected. Please consult with a healthcare provider.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium">Personalized Recommendations</h3>
          <ul className="list-disc pl-4 space-y-1">
            {healthData.prediction.recommendations.map((rec, i) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium">Track Your Progress</h3>
          <Textarea
            placeholder="How are these recommendations working for you?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button 
            onClick={() => feedbackMutation.mutate()}
            disabled={feedbackMutation.isPending}
          >
            Submit Feedback
          </Button>
        </div>

        <Button className="w-full" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Download Summary Report
        </Button>
      </CardContent>
    </Card>
  );
}
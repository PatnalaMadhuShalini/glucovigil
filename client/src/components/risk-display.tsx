import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

export default function RiskDisplay({ data }: { data: any }) {
  const [mlPrediction, setMlPrediction] = useState<number>(0);

  useEffect(() => {
    // Simple neural network for risk prediction
    const predictRisk = async () => {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 16, inputShape: [6], activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      const inputFeatures = [
        data.physiological.bloodSugar / 200,
        data.physiological.bloodPressure.systolic / 200,
        data.physiological.bloodPressure.diastolic / 100,
        data.physiological.weight / 100,
        data.demographics.age / 100,
        data.lifestyle.exercise === 'none' ? 0 : 
          data.lifestyle.exercise === 'light' ? 0.33 : 
          data.lifestyle.exercise === 'moderate' ? 0.66 : 1
      ];

      const prediction = model.predict(tf.tensor2d([inputFeatures])) as tf.Tensor;
      const score = await prediction.data();
      setMlPrediction(score[0]);
    };

    predictRisk();
  }, [data]);

  const riskColor = data.prediction.level === "high" 
    ? "bg-red-500" 
    : data.prediction.level === "moderate" 
    ? "bg-yellow-500" 
    : "bg-green-500";

  const riskPercent = (data.prediction.score / 5) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Diabetes Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Risk Level:</span>
          <span className={`px-3 py-1 rounded-full text-white capitalize ${riskColor}`}>
            {data.prediction.level}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Risk Score</span>
            <span>{data.prediction.score}/5</span>
          </div>
          <Progress value={riskPercent} className={riskColor} />
        </div>

        <div className="mt-4 pt-4 border-t">
          <h3 className="font-medium mb-2">Key Factors:</h3>
          <ul className="text-sm space-y-2">
            <li>Blood Sugar: {data.physiological.bloodSugar} mg/dL</li>
            <li>BMI: {(data.physiological.weight / Math.pow(data.physiological.height/100, 2)).toFixed(1)}</li>
            <li>Exercise Level: {data.lifestyle.exercise}</li>
            <li>Diet Quality: {data.lifestyle.diet}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

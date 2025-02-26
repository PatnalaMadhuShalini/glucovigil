import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

// Create model outside component to prevent recreation
const createModel = () => {
  return tf.sequential({
    layers: [
      tf.layers.dense({ units: 16, inputShape: [6], activation: 'relu' }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });
};

// Memoized model instance
const model = createModel();

// Preprocess features outside component
const preprocessFeatures = (data: any) => {
  return [
    data.physiological.bloodSugar / 200,
    data.physiological.bloodPressure.systolic / 200,
    data.physiological.bloodPressure.diastolic / 100,
    data.physiological.weight / 100,
    data.demographics.age / 100,
    data.lifestyle.exercise === 'none' ? 0 : 
      data.lifestyle.exercise === 'light' ? 0.33 : 
      data.lifestyle.exercise === 'moderate' ? 0.66 : 1
  ];
};

export default function RiskDisplay({ data }: { data: any }) {
  const [mlPrediction, setMlPrediction] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const predictRisk = async () => {
      try {
        // Use tf.tidy to clean up tensors automatically
        const prediction = tf.tidy(() => {
          const inputFeatures = preprocessFeatures(data);
          const inputTensor = tf.tensor2d([inputFeatures]);
          return model.predict(inputTensor) as tf.Tensor;
        });
        
        const score = await prediction.data();
        prediction.dispose(); // Clean up the prediction tensor
        setMlPrediction(score[0]);
        setError('');
      } catch (err) {
        setError('Failed to calculate risk prediction');
        console.error('Prediction error:', err);
      }
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

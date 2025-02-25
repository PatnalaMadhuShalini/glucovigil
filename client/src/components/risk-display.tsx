
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import * as tf from '@tensorflow/tfjs';

export default function RiskDisplay({ data }: { data: any }) {
  const [mlScore, setMlScore] = useState(0);

  useEffect(() => {
    // Simple ML model for diabetes risk prediction
    const predictRisk = async () => {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      const input = tf.tensor2d([[
        data.physiological.bloodSugar / 200, // Normalize values
        data.physiological.bloodPressure.systolic / 200,
        data.physiological.weight / 200,
        data.demographics.age / 100
      ]]);

      const prediction = model.predict(input) as tf.Tensor;
      const score = await prediction.data();
      setMlScore(score[0] * 5); // Scale to 0-5
    };

    predictRisk();
  }, [data]);

  const riskColor = data.prediction.level === "high" 
    ? "bg-red-500" 
    : data.prediction.level === "moderate" 
    ? "bg-yellow-500" 
    : "bg-green-500";

  const riskPercent = (mlScore / 5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div 
            className="flex items-center justify-between mb-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-sm font-medium">Risk Level:</span>
            <span className={`px-3 py-1 rounded-full text-white capitalize ${riskColor}`}>
              {data.prediction.level}
            </span>
          </motion.div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ML Risk Score</span>
              <span>{mlScore.toFixed(2)}/5</span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1 }}
            >
              <Progress value={riskPercent} className={riskColor} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

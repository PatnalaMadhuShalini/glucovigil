import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Utensils, Trophy, Dumbbell, Download, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HealthReport from "./health-report";
import type { HealthDataWithPrediction } from "@shared/schema";

interface RecommendationProps {
  data?: HealthDataWithPrediction;
}

export default function Recommendations({ data }: RecommendationProps) {
  const { toast } = useToast();

  const recommendationIcons = {
    diet: <Utensils className="h-5 w-5 text-green-500" />,
    exercise: <Dumbbell className="h-5 w-5 text-blue-500" />,
    health: <Heart className="h-5 w-5 text-red-500" />,
    lifestyle: <Trophy className="h-5 w-5 text-purple-500" />
  };

  const getIcon = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('diet') || recommendation.toLowerCase().includes('food')) {
      return recommendationIcons.diet;
    } else if (recommendation.toLowerCase().includes('exercise') || recommendation.toLowerCase().includes('activity')) {
      return recommendationIcons.exercise;
    } else if (recommendation.toLowerCase().includes('health') || recommendation.toLowerCase().includes('medical')) {
      return recommendationIcons.health;
    }
    return recommendationIcons.lifestyle;
  };

  // Early return if no data or predictions
  if (!data?.prediction?.recommendations?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Complete your health assessment to receive personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Personalized Recommendations</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Download as text
                const recommendationsText = data.prediction.recommendations.join('\n- ');
                const fullText = `Diabetes Risk Assessment Recommendations\n\nRisk Level: ${data.prediction?.level || 'Unknown'}\n\nRecommendations:\n- ${recommendationsText}`;
                const blob = new Blob([fullText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'health-recommendations.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast({
                  title: "Success",
                  description: "Recommendations downloaded as text",
                });
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Text
            </Button>
            <PDFDownloadLink
              document={<HealthReport data={data} />}
              fileName="health-assessment-report.pdf"
            >
              {({ loading }) => (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.prediction.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border"
            >
              {getIcon(recommendation)}
              <p className="text-sm">{recommendation}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            These recommendations are based on your health assessment data. For personalized medical advice, please consult with a healthcare professional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
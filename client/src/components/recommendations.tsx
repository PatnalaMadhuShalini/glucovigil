import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Utensils, Trophy, Dumbbell, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RecommendationProps = {
  data?: {
    prediction?: {
      recommendations?: string[];
      level?: string;
    };
  };
};

export default function Recommendations({ data }: RecommendationProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!data?.prediction?.recommendations?.length) {
      toast({
        title: "Error",
        description: "No recommendations available to download",
        variant: "destructive",
      });
      return;
    }

    // Create recommendations text
    const recommendationsText = data.prediction.recommendations.join('\n- ');
    const fullText = `Diabetes Risk Assessment Recommendations\n\nRisk Level: ${data.prediction?.level || 'Unknown'}\n\nRecommendations:\n- ${recommendationsText}`;

    // Create blob and download
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
      description: "Recommendations downloaded successfully",
    });
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
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
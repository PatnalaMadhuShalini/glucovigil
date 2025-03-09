import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import HealthTrends from "@/components/health-trends";
import Achievements from "@/components/achievements";
import { LineChart } from "lucide-react";

export default function Progress() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-sky-600" />
            <CardTitle className="text-2xl">Track Your Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Monitor your health improvements and achievements over time.
          </p>
          <HealthTrends />
          <div className="mt-8">
            <Achievements achievements={[]} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

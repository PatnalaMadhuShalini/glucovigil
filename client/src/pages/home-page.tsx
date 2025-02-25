import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to Your Health Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take control of your health with our comprehensive diabetes risk assessment
            and personalized recommendations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <Activity className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Risk Assessment</h2>
              <p className="text-gray-600 mb-4">
                Get an accurate assessment of your diabetes risk based on your health data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Heart className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Health Tracking</h2>
              <p className="text-gray-600 mb-4">
                Monitor your health metrics and track progress over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <ChartBar className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Personalized Insights</h2>
              <p className="text-gray-600 mb-4">
                Receive tailored recommendations based on your health profile.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-2 rounded-lg text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

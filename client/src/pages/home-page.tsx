import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-teal-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="GlucoSmart Logo" 
              className="h-24 w-auto drop-shadow-xl"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
            Welcome to GlucoSmart
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your intelligent companion for diabetes risk assessment and personalized health management
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="transform hover:scale-105 transition-transform duration-300 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
            <CardContent className="p-8">
              <Activity className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Smart Assessment</h2>
              <p className="text-gray-600">
                AI-powered diabetes risk assessment based on your health data
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-300 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
            <CardContent className="p-8">
              <Heart className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Health Tracking</h2>
              <p className="text-gray-600">
                Monitor your health metrics with real-time insights
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-300 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
            <CardContent className="p-8">
              <ChartBar className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Trend Analysis</h2>
              <p className="text-gray-600">
                Visualize your health progress over time
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform duration-300 bg-white/80 backdrop-blur-sm border-2 border-blue-100">
            <CardContent className="p-8">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">AI Assistant</h2>
              <p className="text-gray-600">
                Smart health companion powered by AI
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-10 py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </Link>
        </div>

        <footer className="mt-20 py-8 border-t border-blue-100">
          <div className="text-center text-gray-600">
            <p className="font-medium">GlucoSmart Health Analytics</p>
            <p className="mt-2 text-sm">Your trusted partner in health management</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
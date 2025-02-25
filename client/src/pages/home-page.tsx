import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/attached_assets/logo_1740475848749.png" 
              alt="GlucoSmart Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to GlucoSmart
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your intelligent companion for diabetes risk assessment and personalized health management
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Activity className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Smart Assessment</h2>
              <p className="text-gray-600 mb-4">
                AI-powered diabetes risk assessment based on your health data
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Heart className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Health Tracking</h2>
              <p className="text-gray-600 mb-4">
                Monitor your health metrics with real-time insights
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <ChartBar className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Trend Analysis</h2>
              <p className="text-gray-600 mb-4">
                Visualize your health progress over time
              </p>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
              <p className="text-gray-600 mb-4">
                Voice-enabled health companion at your service
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-2 rounded-lg text-lg">
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p>Created by @PDMS</p>
            <p className="mt-2 text-sm">Your trusted partner in health management</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
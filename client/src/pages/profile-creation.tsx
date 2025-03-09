import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import HealthForm from "@/components/health-form";
import { User } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfileCreation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleComplete = () => {
    setLocation("/analysis"); // After profile creation, go to analysis
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-sky-600" />
            <CardTitle className="text-2xl">Create Your Health Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Enter your health information below to get started with personalized tracking and recommendations.
          </p>
          <HealthForm onComplete={handleComplete} />
        </CardContent>
      </Card>
    </div>
  );
}
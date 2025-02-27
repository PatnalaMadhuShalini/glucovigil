import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-xy" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="GlucoSmart Logo" 
                className="h-32 w-auto drop-shadow-2xl animate-float"
              />
              <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
            Welcome to GlucoSmart
          </h1>
          <p className="text-2xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
            Your intelligent companion for diabetes risk assessment and personalized health management
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: Activity,
              title: "Smart Assessment",
              description: "AI-powered diabetes risk assessment based on your health data"
            },
            {
              icon: Heart,
              title: "Health Tracking",
              description: "Monitor your health metrics with real-time insights"
            },
            {
              icon: ChartBar,
              title: "Trend Analysis",
              description: "Visualize your health progress over time"
            },
            {
              icon: Shield,
              title: "AI Assistant",
              description: "Smart health companion powered by AI"
            }
          ].map((feature, index) => (
            <Card key={index} className="group transform hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-lg border-2 border-white/20 overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <feature.icon className="h-12 w-12 text-blue-300 mb-4 transform group-hover:scale-110 transition-transform duration-300" />
                <h2 className="text-xl font-semibold mb-3 text-white/90">{feature.title}</h2>
                <p className="text-blue-100/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-12 py-6 rounded-2xl text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
              <span className="relative z-10">
                {user ? "Go to Dashboard" : "Get Started"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[url('/sparkles.svg')] bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Button>
          </Link>
        </div>

        <footer className="mt-24 py-8 border-t border-white/10">
          <div className="text-center text-blue-100/80">
            <p className="font-medium text-lg">GlucoSmart Health Analytics</p>
            <p className="mt-2">Your trusted partner in health management</p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors">About</a>
              <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors">Features</a>
              <a href="#" className="text-blue-300 hover:text-blue-200 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 animate-gradient-xy" />

      {/* Refined grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="GlucoSmart Logo" 
                className="h-28 w-auto drop-shadow-lg animate-float-gentle"
              />
              <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-blue-200/80 animate-pulse-subtle" />
            </div>
          </div>
          <h1 className="text-5xl font-medium mb-6 bg-gradient-to-r from-blue-100 via-indigo-200 to-violet-100 bg-clip-text text-transparent drop-shadow">
            Welcome to GlucoSmart
          </h1>
          <p className="text-xl font-light text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
            Your intelligent companion for diabetes risk assessment and personalized health management
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
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
            <Card key={index} className="group transform hover:scale-102 transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/10 overflow-hidden shadow-lg">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <feature.icon className="h-12 w-12 text-blue-200 mb-4 transform group-hover:scale-105 transition-transform duration-500" />
                <h2 className="text-xl font-medium mb-2 text-white/90">{feature.title}</h2>
                <p className="text-sm text-blue-100/80 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white/90 px-10 py-4 rounded-lg text-lg font-normal shadow-md hover:shadow-lg transition-all duration-500">
              <span className="relative z-10">
                {user ? "Go to Dashboard" : "Get Started"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[url('/sparkles.svg')] bg-center opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            </Button>
          </Link>
        </div>

        <footer className="mt-24 py-8 border-t border-white/5">
          <div className="text-center text-blue-100/60">
            <p className="font-normal text-base">GlucoSmart Health Analytics</p>
            <p className="mt-2 text-sm font-light">Your trusted partner in health management</p>
            <p className="mt-1 text-sm font-medium">Created by PDMS</p>
            <div className="mt-6 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-medium text-blue-200 mb-2">About</h3>
                <p className="text-sm text-blue-100/70">
                  GlucoSmart was founded in 2023 to revolutionize diabetes management through AI-powered health analytics and personalized recommendations.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-medium text-blue-200 mb-2">Features</h3>
                <p className="text-sm text-blue-100/70">
                  Advanced risk prediction, personalized health recommendations, medical record integration, and comprehensive health monitoring.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-medium text-blue-200 mb-2">Contact</h3>
                <p className="text-sm text-blue-100/70">
                  Email: support@glucosmart.com<br/>
                  Phone: (555) 123-4567<br/>
                  Location: Health Innovation Center
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-8">
              <a href="#" className="text-blue-200/80 hover:text-blue-200 transition-colors duration-300 text-sm">About</a>
              <a href="#" className="text-blue-200/80 hover:text-blue-200 transition-colors duration-300 text-sm">Features</a>
              <a href="#" className="text-blue-200/80 hover:text-blue-200 transition-colors duration-300 text-sm">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield, Sparkles, Book, Phone, Mail, MapPin } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900">
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 animate-gradient-xy" />

      {/* Refined grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src="/logo.svg" 
                  alt="GlucoSmart Logo" 
                  className="h-28 w-auto drop-shadow-lg animate-float-gentle"
                />
                <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-blue-200 animate-pulse-subtle" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent drop-shadow-lg">
              Welcome to GlucoSmart
            </h1>
            <p className="text-xl font-medium text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Your intelligent companion for diabetes risk assessment and personalized health management. Take control of your health journey with AI-powered insights and expert recommendations.
            </p>
            <Link href={user ? "/dashboard" : "/auth"}>
              <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-lg text-lg font-medium shadow-md hover:shadow-lg transition-all duration-500">
                <span className="relative z-10">
                  {user ? "Go to Dashboard" : "Get Started"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
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
              <Card key={index} className="group transform hover:scale-102 transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <feature.icon className="h-10 w-10 text-blue-300 mb-4 transform group-hover:scale-105 transition-transform duration-500" />
                  <h2 className="text-lg font-semibold mb-2 text-white">{feature.title}</h2>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Why Choose GlucoSmart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Book className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Educational Resources</h3>
                <p className="text-blue-100">Access comprehensive guides and articles about diabetes prevention and management</p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Privacy First</h3>
                <p className="text-blue-100">Your health data is secure with our state-of-the-art encryption and privacy measures</p>
              </div>
              <div className="text-center p-6">
                <Activity className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Expert Support</h3>
                <p className="text-blue-100">Get personalized recommendations from our AI-powered health assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative border-t border-white/20 pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">About GlucoSmart</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Empowering individuals with AI-driven health insights for better diabetes management and prevention.
                </p>
                <p className="text-sm text-blue-100">
                  Created by PDMS
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about">
                      <a className="text-sm text-blue-100 hover:text-white transition-colors">About Us</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/features">
                      <a className="text-sm text-blue-100 hover:text-white transition-colors">Features</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy">
                      <a className="text-sm text-blue-100 hover:text-white transition-colors">Privacy Policy</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms">
                      <a className="text-sm text-blue-100 hover:text-white transition-colors">Terms of Service</a>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-blue-100">
                    <Phone className="h-4 w-4 mr-2" />
                    +1 (555) 123-4567
                  </li>
                  <li className="flex items-center text-sm text-blue-100">
                    <Mail className="h-4 w-4 mr-2" />
                    support@glucosmart.com
                  </li>
                  <li className="flex items-center text-sm text-blue-100">
                    <MapPin className="h-4 w-4 mr-2" />
                    123 Health Street, Medical District
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-blue-100 hover:text-white transition-colors">
                    Twitter
                  </a>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                  <a href="#" className="text-blue-100 hover:text-white transition-colors">
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center border-t border-white/20 pt-8">
              <p className="text-sm text-blue-100">
                © {new Date().getFullYear()} GlucoSmart. All rights reserved.
              </p>
              <p className="text-sm text-blue-100 mt-2">
                Created with passion by PDMS
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
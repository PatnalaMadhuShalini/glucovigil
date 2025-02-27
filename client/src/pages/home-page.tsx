import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Activity, ChartBar, Heart, Shield, Sparkles, CheckCircle, Clock, User } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200"> {/*Brighter background*/}
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-sky-600/10 to-sky-700/10 animate-gradient-xy" />

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
              <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-sky-700 animate-pulse-subtle" /> {/*Darker icon*/}
            </div>
          </div>
          <h1 className="text-5xl font-medium mb-6 animate-text-gradient bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-[length:400%_100%] bg-clip-text text-transparent drop-shadow"> {/*Added animated color-changing text*/}
            Welcome to GlucoSmart
          </h1>
          <p className="text-xl font-light text-gray-800 max-w-3xl mx-auto leading-relaxed"> {/*Improved contrast*/}
            Your intelligent companion for diabetes risk assessment and personalized health management
          </p>
        </div>

        {/* Key Features Section */}
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
            <Card key={index} className="group transform hover:scale-102 transition-all duration-500 bg-white/10 backdrop-blur-sm border border-gray-200 overflow-hidden shadow-lg"> {/*Brighter card*/}
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 to-sky-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> {/*Brighter gradient*/}
                <feature.icon className="h-12 w-12 text-sky-700 mb-4 transform group-hover:scale-105 transition-transform duration-500" /> {/*Darker icon*/}
                <h2 className="text-xl font-medium mb-2 text-gray-900">{feature.title}</h2> {/*Improved contrast*/}
                <p className="text-sm text-gray-700 leading-relaxed"> {/*Improved contrast*/}
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Information Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">How GlucoSmart Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: User,
                title: "Create Your Profile",
                description: "Enter your basic information and health metrics to get started with personalized health tracking."
              },
              {
                step: 2,
                icon: Activity,
                title: "Get Personalized Analysis",
                description: "Our AI analyzes your data to provide risk assessments and tailored health recommendations."
              },
              {
                step: 3,
                icon: CheckCircle,
                title: "Track Your Progress",
                description: "Monitor your health improvements over time and achieve your wellness goals with our comprehensive tracking tools."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg border border-sky-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sky-100 w-16 h-16 flex items-center justify-center rounded-bl-lg">
                  <span className="text-2xl font-bold text-sky-700">{item.step}</span>
                </div>
                <item.icon className="h-12 w-12 text-sky-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-8 shadow-lg border border-sky-100">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Why Choose GlucoSmart?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Early Risk Detection</h3>
                <p className="text-gray-600">Identify potential health risks before they become serious with our advanced prediction models.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Personalized Recommendations</h3>
                <p className="text-gray-600">Receive customized health advice and action plans tailored to your unique health profile.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Comprehensive Tracking</h3>
                <p className="text-gray-600">Monitor all your health metrics in one place with intuitive visualization tools.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Evidence-Based Guidance</h3>
                <p className="text-gray-600">Our recommendations are based on the latest medical research and health guidelines.</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah J.",
                role: "Health Enthusiast",
                quote: "GlucoSmart has completely changed how I monitor my health. The personalized insights have helped me make better lifestyle choices."
              },
              {
                name: "Michael T.",
                role: "Diabetes Patient",
                quote: "As someone with a family history of diabetes, this app has been invaluable for keeping track of my risk factors and making preventive changes."
              },
              {
                name: "Elena R.",
                role: "Fitness Coach",
                quote: "I recommend GlucoSmart to all my clients. The comprehensive health tracking and actionable recommendations are exactly what people need."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white border border-sky-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button className="relative overflow-hidden group bg-gradient-to-r from-sky-600/90 to-sky-700/90 hover:from-sky-700 hover:to-sky-800 text-gray-100 px-10 py-4 rounded-lg text-lg font-normal shadow-md hover:shadow-lg transition-all duration-500"> {/*Brighter button*/}
              <span className="relative z-10">
                {user ? "Go to Dashboard" : "Get Started"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/30 to-sky-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[url('/sparkles.svg')] bg-center opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            </Button>
          </Link>
        </div>

        <footer className="mt-24 py-8 border-t border-gray-200"> {/*Brighter border*/}
          <div className="text-center text-gray-700"> {/*Improved contrast*/}
            <p className="font-normal text-base">GlucoSmart Health Analytics</p>
            <p className="mt-2 text-sm font-light">Your trusted partner in health management</p>
            <p className="mt-1 text-sm font-medium">Created by PDMS</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
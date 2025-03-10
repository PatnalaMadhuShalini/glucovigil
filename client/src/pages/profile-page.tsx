import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, History, FileText, Activity } from "lucide-react";
import type { HealthDataWithPrediction } from "@shared/schema";
import HealthForm from "@/components/health-form";

export default function ProfilePage() {
  console.log('ProfilePage: Mounting component');
  const { user } = useAuth();
  console.log('ProfilePage: Auth state:', { user });

  const [showHealthForm, setShowHealthForm] = useState(false);

  const { data: healthData, isLoading } = useQuery<HealthDataWithPrediction[]>({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-100">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  console.log('ProfilePage: Rendering with data:', { healthData });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-200">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-indigo-500/10 animate-gradient-xy" />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="grid gap-6">
          {/* User Profile Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white border border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Activity className="h-5 w-5 text-sky-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="font-medium text-gray-700">Username</label>
                  <p className="mt-1">{user?.username}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Full Name</label>
                  <p className="mt-1">{user?.fullName}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Email</label>
                  <p className="mt-1">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Data and Reports Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-white border border-sky-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Health Reports & History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="history">
                <TabsList className="mb-4">
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-2" />
                    Activity History
                  </TabsTrigger>
                  <TabsTrigger value="reports">
                    <FileText className="h-4 w-4 mr-2" />
                    Health Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                  <div className="space-y-4">
                    {healthData?.map((entry, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-sky-50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`text-sm font-medium ${
                            entry.prediction?.level === 'high' ? 'text-red-500' :
                            entry.prediction?.level === 'moderate' ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {entry.prediction?.level.toUpperCase()} Risk
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Blood Sugar: {entry.physiological.bloodSugar} mg/dL
                          </p>
                          <p className="text-sm text-gray-600">
                            BP: {entry.physiological.bloodPressure.systolic}/{entry.physiological.bloodPressure.diastolic}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <div className="space-y-4">
                    {healthData?.length ? (
                      <div className="grid gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-sky-50">
                          <h3 className="font-medium mb-2 text-gray-800">Latest Report</h3>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Risk Level: {healthData[healthData.length - 1].prediction?.level.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {healthData[healthData.length - 1].prediction?.score}
                            </p>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2 text-gray-700">Recommendations:</h4>
                              <ul className="list-disc pl-4 text-sm text-gray-600">
                                {healthData[healthData.length - 1].prediction?.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No health reports available yet.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Button
                  onClick={() => setShowHealthForm(true)}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
                >
                  Update Health Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {showHealthForm && (
            <Card className="shadow-lg bg-white border border-sky-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Update Health Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-sky-50 p-6 rounded-lg">
                  <HealthForm onComplete={() => setShowHealthForm(false)} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
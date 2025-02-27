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
  const { user, logoutMutation } = useAuth();
  const [showHealthForm, setShowHealthForm] = useState(false);

  const { data: healthData, isLoading } = useQuery<HealthDataWithPrediction[]>({
    queryKey: ["/api/health-data"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* User Profile Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
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
                <div>
                  <label className="font-medium text-gray-700">Phone</label>
                  <p className="mt-1">{user?.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Data and Reports Section */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Health Reports & History</CardTitle>
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
                      <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                        <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="font-medium mb-2">Latest Report</h3>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Risk Level: {healthData[healthData.length - 1].prediction?.level.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {healthData[healthData.length - 1].prediction?.score}
                            </p>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Update Health Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {showHealthForm && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Update Health Information</CardTitle>
              </CardHeader>
              <CardContent>
                <HealthForm onComplete={() => setShowHealthForm(false)} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
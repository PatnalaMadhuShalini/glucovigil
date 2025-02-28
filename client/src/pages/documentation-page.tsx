import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function DocumentationPage() {
  const [abstract, setAbstract] = useState<string>("");
  const [mlDoc, setMlDoc] = useState<string>("");
  const [requirementsDoc, setRequirementsDoc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [mlLoading, setMlLoading] = useState<boolean>(true);
  const [reqLoading, setReqLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch the abstract markdown file
    fetch("/glucosmart-abstract.md")
      .then(response => response.text())
      .then(text => {
        setAbstract(text);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading abstract documentation:", error);
        setLoading(false);
      });

    // Fetch the ML documentation markdown file
    fetch("/glucosmart-ml.md")
      .then(response => response.text())
      .then(text => {
        setMlDoc(text);
        setMlLoading(false);
      })
      .catch(error => {
        console.error("Error loading ML documentation:", error);
        setMlLoading(false);
      });

    // Fetch the system requirements markdown file
    fetch("/system-requirements.md")
      .then(response => response.text())
      .then(text => {
        setRequirementsDoc(text);
        setReqLoading(false);
      })
      .catch(error => {
        console.error("Error loading requirements documentation:", error);
        setReqLoading(false);
      });
  }, []);

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    // Convert headers
    let html = markdown
      .replace(/# (.*$)/gim, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/## (.*$)/gim, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/#### (.*$)/gim, '<h4 class="text-md font-bold my-2">$1</h4>')
      // Convert lists
      .replace(/^\s*-\s*(.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      // Convert paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      // Add line breaks
      .replace(/\n/g, '<br>');

    return `<p class="my-2">${html}</p>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-sky-800">
          GlucoSmart Documentation
        </h1>

        <Tabs defaultValue="abstract" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
            <TabsTrigger value="usecases">Use Cases</TabsTrigger>
            <TabsTrigger value="ml">AI & ML</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sequence">Sequence</TabsTrigger>
            <TabsTrigger value="statechart">Statechart</TabsTrigger>
            <TabsTrigger value="class">Class</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="abstract">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  GlucoSmart Project Abstract
                </CardTitle>
              </CardHeader>
              <CardContent className="documentation-content">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                  </div>
                ) : (
                  <div 
                    className="prose prose-sky max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(abstract) }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usecases">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  Use Case Diagram
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="max-w-full overflow-auto">
                  <img 
                    src="/use-case-diagram.svg" 
                    alt="GlucoSmart Use Case Diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  AI & Machine Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none">
                  <h2 className="text-xl font-bold my-3">Current Algorithms</h2>
                  <p className="my-2">
                    The current version of GlucoSmart primarily uses rule-based clinical algorithms rather than active machine learning models:
                  </p>
                  <ul className="my-4">
                    <li className="ml-6 list-disc"><strong>Risk Assessment Algorithm:</strong> Uses a points-based system with thresholds derived from medical guidelines to calculate diabetes risk.</li>
                    <li className="ml-6 list-disc"><strong>Recommendation Engine:</strong> Applies conditional logic based on identified risk factors to generate personalized health recommendations.</li>
                    <li className="ml-6 list-disc"><strong>Pattern Recognition:</strong> Uses regular expressions and simple pattern matching to extract health data from medical records.</li>
                  </ul>

                  <h2 className="text-xl font-bold my-3 mt-6">Planned ML Integration</h2>
                  <p className="my-2">
                    The application architecture is designed to incorporate more advanced machine learning capabilities in future iterations:
                  </p>
                  <ul className="my-4">
                    <li className="ml-6 list-disc">
                      <strong>Predictive Risk Modeling:</strong> Supervised learning models (Gradient Boosting, Random Forests) trained on historical patient data to improve prediction accuracy.
                    </li>
                    <li className="ml-6 list-disc">
                      <strong>Natural Language Processing:</strong> Transformer-based models for more sophisticated extraction and analysis of unstructured text from medical documents.
                    </li>
                    <li className="ml-6 list-disc">
                      <strong>Time Series Analysis:</strong> Recurrent Neural Networks (RNNs) or LSTM networks to detect trends in blood glucose measurements over time.
                    </li>
                    <li className="ml-6 list-disc">
                      <strong>Personalized Recommendation Systems:</strong> Collaborative filtering and content-based recommendation systems that learn from user feedback and outcomes.
                    </li>
                  </ul>

                  <h2 className="text-xl font-bold my-3 mt-6">ML Technology Stack</h2>
                  <p className="my-2">
                    The application is built with ML integration capabilities using:
                  </p>
                  <ul className="my-4">
                    <li className="ml-6 list-disc"><strong>TensorFlow.js:</strong> For client-side ML processing and model inference</li>
                    <li className="ml-6 list-disc"><strong>MediaPipe:</strong> For text analysis and natural language processing tasks</li>
                  </ul>

                  <h2 className="text-xl font-bold my-3 mt-6">ML/AI Architecture Diagram</h2>
                  <div className="flex justify-center my-6">
                    <img 
                      src="/ml-use-case-diagram.svg" 
                      alt="GlucoSmart ML/AI Use Case Diagram" 
                      className="max-w-full h-auto border border-sky-100 rounded-lg"
                    />
                  </div>

                  <h2 className="text-xl font-bold my-3 mt-6">Detailed ML Documentation</h2>
                  {mlLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(mlDoc) }} />
                  )}

                  <p className="my-2 mt-6">
                    This phased approach allows the application to start with transparent, explainable algorithms while building toward more sophisticated ML capabilities as more user data becomes available for training.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  Activity Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none mb-4">
                  <p>
                    This activity diagram illustrates the flow of actions in the GlucoSmart application, showing how users interact with the system to submit health data, receive assessments, and view recommendations.
                  </p>
                </div>
                <div className="flex justify-center overflow-auto border border-sky-100 rounded-lg p-4 bg-white">
                  <img 
                    src="/activity-diagram.svg" 
                    alt="GlucoSmart Activity Diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="prose prose-sky max-w-none mt-6">
                  <h3 className="text-lg font-bold">Key Activities</h3>
                  <ul>
                    <li className="ml-6 list-disc"><strong>User Activities:</strong> Login/Register, Enter Health Data, View Dashboard, Track Symptoms, Upload Medical Records</li>
                    <li className="ml-6 list-disc"><strong>Frontend Activities:</strong> Authentication UI, Health Form, Form Validation, Results Display</li>
                    <li className="ml-6 list-disc"><strong>Backend Activities:</strong> Authentication Service, Process Health Data, Calculate Risk Score, Generate Recommendations, Store Health Data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sequence">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  Sequence Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none mb-4">
                  <p>
                    This sequence diagram shows the interactions between different components of the GlucoSmart system during a typical user session, including authentication, health data submission, and recommendation retrieval.
                  </p>
                </div>
                <div className="flex justify-center overflow-auto border border-sky-100 rounded-lg p-4 bg-white">
                  <img 
                    src="/sequence-diagram.svg" 
                    alt="GlucoSmart Sequence Diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="prose prose-sky max-w-none mt-6">
                  <h3 className="text-lg font-bold">Key Interactions</h3>
                  <ul>
                    <li className="ml-6 list-disc"><strong>Authentication Flow:</strong> User login/register → UI → API Client → API Server → Database → User</li>
                    <li className="ml-6 list-disc"><strong>Health Data Flow:</strong> User submits data → Client-side validation → API request → Server processing → Risk calculation → Database storage → Response with assessment</li>
                    <li className="ml-6 list-disc"><strong>Recommendation Flow:</strong> User views dashboard → Request recommendations → Server retrieves personalized insights → Display to user</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statechart">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  Statechart Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none mb-4">
                  <p>
                    The statechart diagram models the different states and transitions in the GlucoSmart user session, showing how the system moves between states based on user actions and system events.
                  </p>
                </div>
                <div className="flex justify-center overflow-auto border border-sky-100 rounded-lg p-4 bg-white">
                  <img 
                    src="/statechart-diagram.svg" 
                    alt="GlucoSmart Statechart Diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="prose prose-sky max-w-none mt-6">
                  <h3 className="text-lg font-bold">Key States</h3>
                  <ul>
                    <li className="ml-6 list-disc"><strong>Anonymous User States:</strong> Home Page Viewing, Authentication</li>
                    <li className="ml-6 list-disc"><strong>Authenticated User States:</strong> Dashboard Viewing, Health Data Entry, Risk Assessment, Recommendation Viewing, Profile Management</li>
                    <li className="ml-6 list-disc"><strong>Transitions:</strong> Login/register, logout, session timeout, navigation between application features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="class">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  Class Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none mb-4">
                  <p>
                    This class diagram represents the data model and component organization of the GlucoSmart application, showing the relationships between different classes and components.
                  </p>
                </div>
                <div className="flex justify-center overflow-auto border border-sky-100 rounded-lg p-4 bg-white">
                  <img 
                    src="/class-diagram.svg" 
                    alt="GlucoSmart Class Diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="prose prose-sky max-w-none mt-6">
                  <h3 className="text-lg font-bold">Data Model</h3>
                  <ul>
                    <li className="ml-6 list-disc"><strong>User:</strong> Represents user account with authentication details</li>
                    <li className="ml-6 list-disc"><strong>HealthData:</strong> Core health metrics and assessment data</li>
                    <li className="ml-6 list-disc"><strong>Symptoms:</strong> User-reported symptoms with severity and timing</li>
                    <li className="ml-6 list-disc"><strong>MedicalRecord:</strong> Uploaded medical documents and extracted data</li>
                    <li className="ml-6 list-disc"><strong>Achievement:</strong> Gamification elements for user engagement</li>
                  </ul>

                  <h3 className="text-lg font-bold mt-4">Components</h3>
                  <ul>
                    <li className="ml-6 list-disc"><strong>AuthProvider:</strong> Manages user authentication state</li>
                    <li className="ml-6 list-disc"><strong>HealthForm:</strong> Collects and validates health data</li>
                    <li className="ml-6 list-disc"><strong>RiskDisplay:</strong> Visualizes risk assessment results</li>
                    <li className="ml-6 list-disc"><strong>MedicalRecordsUpload:</strong> Handles document uploads</li>
                    <li className="ml-6 list-disc"><strong>Achievements:</strong> Displays user achievements</li>
                    <li className="ml-6 list-disc"><strong>ChatAssistant:</strong> Provides interactive guidance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements">
            <Card className="bg-white shadow-lg border border-sky-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-sky-700">
                  System Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sky max-w-none mb-4">
                  <p>
                    This section details the external interfaces, system requirements, and functional/non-functional requirements for the GlucoSmart application.
                  </p>
                </div>
                {reqLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                  </div>
                ) : (
                  <div 
                    className="prose prose-sky max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(requirementsDoc) }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
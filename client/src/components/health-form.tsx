import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { healthDataSchema, type HealthData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MedicalRecordsUpload from "./medical-records-upload";
import {Checkbox} from "@/components/ui/checkbox";

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground inline-block cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function HealthForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const defaultValues: HealthData = {
    demographics: {
      age: 0,
      gender: "male",
      ethnicity: "",
    },
    physiological: {
      height: 0,
      weight: 0,
      bloodPressure: {
        systolic: 0,
        diastolic: 0,
      },
      bloodSugar: 0,
      a1c: undefined,
      gtt: undefined,
      hemoglobin: undefined,
      immunityMarkers: {
        wbc: undefined,
        lymphocytes: undefined,
        neutrophils: undefined,
      },
    },
    familyHistory: {
      diabetesInFamily: false,
      diabeticRelatives: [],
      otherConditions: [],
    },
    mentalHealth: {
      stressLevel: "low",
      moodPattern: "stable",
      sleepQuality: "good",
      anxietyLevel: "minimal",
      copingMechanisms: [],
    },
    lifestyle: {
      exercise: "none",
      diet: "fair",
      workStyle: "sedentary",
      alcohol: "never",
      smoking: "never",
    },
    financialStatus: {
      insuranceCoverage: false,
      medicationAccessibility: "moderate",
      regularCheckupAbility: false,
      financialStress: "low",
    },
  };

  const form = useForm<HealthData>({
    resolver: zodResolver(healthDataSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: HealthData) => {
      setError(null);
      try {
        const res = await fetch("/api/health-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to submit health data");
        }

        return res.json();
      } catch (err) {
        console.error("Mutation error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your health data has been saved successfully",
      });
      onComplete();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (formData: HealthData) => {
    try {
      const transformedData: HealthData = {
        demographics: {
          age: Number(formData.demographics.age),
          gender: formData.demographics.gender,
          ethnicity: formData.demographics.ethnicity,
        },
        physiological: {
          height: Number(formData.physiological.height),
          weight: Number(formData.physiological.weight),
          bloodPressure: {
            systolic: Number(formData.physiological.bloodPressure.systolic),
            diastolic: Number(formData.physiological.bloodPressure.diastolic),
          },
          bloodSugar: Number(formData.physiological.bloodSugar),
          a1c: formData.physiological.a1c,
          gtt: formData.physiological.gtt,
          hemoglobin: formData.physiological.hemoglobin,
          immunityMarkers: formData.physiological.immunityMarkers || {
            wbc: undefined,
            lymphocytes: undefined,
            neutrophils: undefined,
          },
        },
        familyHistory: formData.familyHistory,
        mentalHealth: formData.mentalHealth,
        lifestyle: formData.lifestyle,
        financialStatus: formData.financialStatus || {
          insuranceCoverage: false,
          medicationAccessibility: "moderate",
          regularCheckupAbility: false,
          financialStress: "low",
        },
      };

      console.log("Submitting health data:", transformedData);
      mutation.mutate(transformedData);
    } catch (error) {
      console.error("Form submission error:", error);
      setError("Failed to process form data");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Demographics Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <InfoTooltip content="Basic information about you that helps us provide more accurate health insights." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="demographics.age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demographics.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demographics.ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethnicity</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    This helps assess specific health risk factors.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Physical Measurements Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Physical Measurements</h2>
            <InfoTooltip content="Your physical measurements help us calculate important health indicators like BMI." />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="physiological.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your height in centimeters (e.g., 170 cm = 5'7")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your weight in kilograms (e.g., 70 kg = 154 lbs)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Blood Pressure and Sugar Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Blood Pressure & Sugar</h2>
            <InfoTooltip content="These vital measurements help assess your cardiovascular health and diabetes risk." />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Where to find these numbers?</h3>
            <ul className="list-disc pl-4 space-y-2 text-sm">
              <li>Blood pressure can be measured at home with a blood pressure monitor, at a pharmacy, or during your last doctor's visit</li>
              <li>Blood sugar (glucose) can be measured using a glucose meter, from a recent lab test, or from your last doctor's visit</li>
              <li>Normal blood sugar range: 70-100 mg/dL (fasting)</li>
              <li>Normal blood pressure range: below 120/80 mmHg</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="physiological.bloodPressure.systolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic Blood Pressure</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The top number in blood pressure reading (e.g., 120 in 120/80)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodPressure.diastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic Blood Pressure</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The bottom number in blood pressure reading (e.g., 80 in 120/80)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodSugar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Your fasting blood glucose level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


        {/* Family History Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Family History</h2>
            <InfoTooltip content="Information about diabetes and other conditions in your family can help assess your risk factors." />
          </div>

          <FormField
            control={form.control}
            name="familyHistory.diabetesInFamily"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Family history of diabetes</FormLabel>
              </FormItem>
            )}
          />

          {/* Add fields for diabetic relatives and other conditions */}
        </div>

        {/* Mental Health Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Mental Health & Stress</h2>
            <InfoTooltip content="Your mental well-being plays a crucial role in managing diabetes risk and overall health." />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mentalHealth.stressLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (Rarely feel stressed)</SelectItem>
                      <SelectItem value="moderate">Moderate (Sometimes stressed)</SelectItem>
                      <SelectItem value="high">High (Often stressed)</SelectItem>
                      <SelectItem value="severe">Severe (Constantly stressed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mentalHealth.moodPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood Pattern</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="depressed">Depressed</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Clinical Markers Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Clinical Markers</h2>
            <InfoTooltip content="These medical test results help provide a more accurate assessment of your health status." />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Understanding Clinical Markers</h3>
            <ul className="list-disc pl-4 space-y-2 text-sm">
              <li><strong>A1C (HbA1c):</strong> This test shows your average blood sugar level over the past 2-3 months. Normal range is typically between 4% and 5.6%. Higher values may indicate diabetes risk.</li>
              <li><strong>Hemoglobin:</strong> This measures oxygen-carrying protein in your blood. Normal range is typically 12-16 g/dL for women and 13-17 g/dL for men.</li>
              <li><strong>Glucose Tolerance Test:</strong> This test measures how well your body processes sugar. Values are measured in mg/dL, and your doctor can help interpret the results.</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="physiological.a1c"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>A1C (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.7"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Found in your recent lab work or diabetes check-up results. Normal range: 4-5.6%
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.hemoglobin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hemoglobin (g/dL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 14.0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Found in your complete blood count (CBC) test results. Normal range: 12-17 g/dL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.gtt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucose Tolerance Test (mg/dL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 140"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    A test that measures how your body processes sugar. Ask your healthcare provider for this value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Lifestyle Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Lifestyle Factors</h2>
            <InfoTooltip content="Your daily habits and lifestyle choices significantly impact your health risk factors." />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="lifestyle.exercise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (No regular exercise)</SelectItem>
                      <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="heavy">Heavy (6-7 days/week)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor (Mostly processed foods)</SelectItem>
                      <SelectItem value="fair">Fair (Mix of healthy and processed)</SelectItem>
                      <SelectItem value="good">Good (Mostly whole foods)</SelectItem>
                      <SelectItem value="excellent">Excellent (Well-balanced, whole foods)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.stressLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (Rarely feel stressed)</SelectItem>
                      <SelectItem value="moderate">Moderate (Sometimes stressed)</SelectItem>
                      <SelectItem value="high">High (Often stressed)</SelectItem>
                      <SelectItem value="severe">Severe (Constantly stressed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.workStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Style</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (Mostly sitting)</SelectItem>
                      <SelectItem value="light">Light Activity (Some walking)</SelectItem>
                      <SelectItem value="moderate">Moderate Activity (Regular movement)</SelectItem>
                      <SelectItem value="active">Very Active (Constant movement)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.alcohol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption Pattern</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never Consumed</SelectItem>
                      <SelectItem value="occasional">Occasional (Rare Events)</SelectItem>
                      <SelectItem value="social">Social Settings Only</SelectItem>
                      <SelectItem value="moderate">Moderate Regular Use</SelectItem>
                      <SelectItem value="heavy">Heavy Regular Use</SelectItem>
                      <SelectItem value="binge">Binge Pattern</SelectItem>
                      <SelectItem value="experimental">Experimental (Tried Once/Twice)</SelectItem>
                      <SelectItem value="former">Former Consumer (Quit)</SelectItem>
                      <SelectItem value="relapsing">Occasional Relapse</SelectItem>
                      <SelectItem value="situational">Situational Use Only</SelectItem>
                      <SelectItem value="passive">Passive Exposure Only</SelectItem>
                      <SelectItem value="dependent">Showing Dependency</SelectItem>
                      <SelectItem value="recovering">In Recovery/Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the option that best describes your alcohol consumption pattern
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.smoking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Smoking Pattern</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never Smoked</SelectItem>
                      <SelectItem value="occasional">Occasional (Rare Events)</SelectItem>
                      <SelectItem value="social">Social Settings Only</SelectItem>
                      <SelectItem value="moderate">Moderate Regular Use</SelectItem>
                      <SelectItem value="heavy">Heavy Regular Use</SelectItem>
                      <SelectItem value="binge">Binge Pattern</SelectItem>
                      <SelectItem value="experimental">Experimental (Tried Once/Twice)</SelectItem>
                      <SelectItem value="former">Former Smoker (Quit)</SelectItem>
                      <SelectItem value="relapsing">Occasional Relapse</SelectItem>
                      <SelectItem value="situational">Situational Use Only</SelectItem>
                      <SelectItem value="passive">Passive Exposure Only</SelectItem>
                      <SelectItem value="dependent">Showing Dependency</SelectItem>
                      <SelectItem value="recovering">In Recovery/Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the option that best describes your smoking pattern
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Financial Status Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Healthcare Access</h2>
            <InfoTooltip content="Understanding your access to healthcare helps us provide more relevant recommendations." />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">About Healthcare Access</h3>
            <ul className="list-disc pl-4 space-y-2 text-sm">
              <li><strong>Insurance Coverage:</strong> Having health insurance can significantly impact your ability to access regular healthcare and medications.</li>
              <li><strong>Medication Access:</strong> This refers to how easily you can obtain and afford prescribed medications.</li>
              <li><strong>Regular Check-ups:</strong> The ability to visit healthcare providers for routine check-ups and monitoring.</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="financialStatus.insuranceCoverage"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Have health insurance coverage</FormLabel>
                  </div>
                  <FormDescription className="ml-6">
                    Check this if you have any form of health insurance (private, employer-provided, or government)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financialStatus.medicationAccessibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access to Medications</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accessibility level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy - No problems getting medications</SelectItem>
                      <SelectItem value="moderate">Moderate - Some difficulties but manageable</SelectItem>
                      <SelectItem value="difficult">Difficult - Significant barriers to getting medications</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How easily can you obtain and afford your prescribed medications?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Medical Records Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Medical Records (Optional)</h2>
            <InfoTooltip content="Upload your medical records for more accurate health predictions and personalized recommendations." />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload your medical records for AI-powered analysis and more accurate health predictions.
          </p>
          <MedicalRecordsUpload />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Health Data"
          )}
        </Button>
      </form>
    </Form>
  );
}
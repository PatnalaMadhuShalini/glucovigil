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
      ethnicity: "other",
      familyHistory: {
        parents: false,
        siblings: false,
        children: false
      },
      gestationalDiabetes: false
    },
    physiological: {
      height: 0,
      weight: 0,
      waistCircumference: 0,
      bloodPressure: {
        systolic: 0,
        diastolic: 0,
      },
      bloodSugar: 0,
      priorPrediabetes: false,
      heartDisease: false
    },
    lifestyle: {
      exercise: {
        frequency: "none",
        intensity: "light",
        minutesPerWeek: 0
      },
      diet: {
        quality: "fair",
        fruitsVegetables: 0,
        processedFoods: 0,
        sugaryDrinks: 0
      },
      sleep: {
        hoursPerNight: 7,
        quality: "fair"
      },
      stressLevel: "moderate",
      workStyle: "sedentary",
      alcohol: {
        frequency: "none",
        drinksPerWeek: 0
      },
      smoking: false
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
          familyHistory: formData.demographics.familyHistory,
          gestationalDiabetes: formData.demographics.gestationalDiabetes === true,
        },
        physiological: {
          height: Number(formData.physiological.height),
          weight: Number(formData.physiological.weight),
          waistCircumference: Number(formData.physiological.waistCircumference),
          bloodPressure: {
            systolic: Number(formData.physiological.bloodPressure.systolic),
            diastolic: Number(formData.physiological.bloodPressure.diastolic),
          },
          bloodSugar: Number(formData.physiological.bloodSugar),
          priorPrediabetes: formData.physiological.priorPrediabetes === true,
          heartDisease: formData.physiological.heartDisease === true
        },
        lifestyle: {
          exercise: formData.lifestyle.exercise,
          diet: formData.lifestyle.diet,
          sleep: formData.lifestyle.sleep,
          stressLevel: formData.lifestyle.stressLevel,
          workStyle: formData.lifestyle.workStyle,
          alcohol: formData.lifestyle.alcohol,
          smoking: formData.lifestyle.smoking === true
        }
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
            <FormField
              control={form.control}
              name="demographics.familyHistory.parents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family History: Parents</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="demographics.familyHistory.siblings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family History: Siblings</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="demographics.familyHistory.children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family History: Children</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="demographics.gestationalDiabetes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gestational Diabetes</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
            <FormField
              control={form.control}
              name="physiological.waistCircumference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Circumference (cm)</FormLabel>
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
          </div>
        </div>

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
            <FormField
              control={form.control}
              name="physiological.priorPrediabetes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prior Prediabetes Diagnosis</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="physiological.heartDisease"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heart Disease Diagnosis</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Lifestyle Factors</h2>
            <InfoTooltip content="Your daily habits and lifestyle choices significantly impact your health risk factors." />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="lifestyle.exercise.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="occasional">Occasional (1-2 times/month)</SelectItem>
                      <SelectItem value="regular">Regular (1-2 times/week)</SelectItem>
                      <SelectItem value="frequent">Frequent (3+ times/week)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.exercise.intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Intensity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise intensity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="vigorous">Vigorous</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.exercise.minutesPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minutes of Exercise per Week</FormLabel>
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
              name="lifestyle.diet.quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Diet Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lifestyle.diet.fruitsVegetables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Servings of Fruits & Vegetables</FormLabel>
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
              name="lifestyle.diet.processedFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Servings of Processed Foods</FormLabel>
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
              name="lifestyle.diet.sugaryDrinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Servings of Sugary Drinks</FormLabel>
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
              name="lifestyle.alcohol.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="occasional">Occasional (1-2 times/month)</SelectItem>
                      <SelectItem value="regular">Regular (1-2 times/week)</SelectItem>
                      <SelectItem value="frequent">Frequent (3+ times/week)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lifestyle.alcohol.drinksPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Alcoholic Drinks per Week</FormLabel>
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
              name="lifestyle.smoking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Smoking</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? field.value.toString() : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Do you smoke?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lifestyle.sleep.hoursPerNight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of Sleep per Night</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="24"
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
              name="lifestyle.sleep.quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
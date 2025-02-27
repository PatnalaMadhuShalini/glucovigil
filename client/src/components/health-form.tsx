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

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 ml-2 text-gray-500 inline-block cursor-help" />
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

  const form = useForm<HealthData>({
    resolver: zodResolver(healthDataSchema),
    defaultValues: {
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
      },
      lifestyle: {
        exercise: "none",
        diet: "fair",
        stressLevel: "moderate",
        workStyle: "sedentary",
        alcohol: false,
        smoking: false
      },
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: HealthData) => {
      console.log('Submitting health data:', JSON.stringify(data, null, 2));
      const res = await apiRequest("POST", "/api/health-data", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit health data");
      }
      return res.json();
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
      console.error('Health data submission error:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (formData: HealthData) => {
    try {
      setError(null);
      console.log('Raw form data:', JSON.stringify(formData, null, 2));

      const validatedData: HealthData = {
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
        },
        lifestyle: {
          exercise: formData.lifestyle.exercise,
          diet: formData.lifestyle.diet,
          stressLevel: formData.lifestyle.stressLevel,
          workStyle: formData.lifestyle.workStyle,
          alcohol: Boolean(formData.lifestyle.alcohol),
          smoking: Boolean(formData.lifestyle.smoking)
        }
      };

      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      await mutation.mutateAsync(validatedData);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit health data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <InfoTooltip content="Basic information about you that helps us provide more accurate health insights." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="demographics.age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
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
                    Your age helps us assess age-related health factors
                  </FormDescription>
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
                  <FormDescription>
                    Gender can affect various health risk factors
                  </FormDescription>
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
                    Different ethnicities may have different health risk factors
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
            <h2 className="text-xl font-semibold text-gray-900">Physical Measurements</h2>
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
            <h2 className="text-xl font-semibold text-gray-900">Blood Pressure & Sugar</h2>
            <InfoTooltip content="These vital measurements help assess your cardiovascular health and diabetes risk." />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4 text-gray-700">
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

        {/* Lifestyle Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">Lifestyle Factors</h2>
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
                  <FormDescription>
                    Regular physical activity helps maintain good health
                  </FormDescription>
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
                  <FormDescription>
                    Your diet quality affects your overall health
                  </FormDescription>
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
                  <FormDescription>
                    Chronic stress can impact your health significantly
                  </FormDescription>
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
                  <FormDescription>
                    Your work activity level affects your daily energy expenditure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifestyle.alcohol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Do you consume alcohol?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Regular alcohol consumption can affect your health
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
                  <FormLabel>Smoking</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Do you smoke?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Smoking is a major risk factor for many health conditions
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
            <h2 className="text-xl font-semibold text-gray-900">Medical Records (Optional)</h2>
            <InfoTooltip content="Upload your medical records for more accurate health predictions and personalized recommendations." />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              You can upload your medical records to receive more personalized health insights and recommendations. 
              This helps our AI system better understand your health history and provide more accurate predictions.
            </p>
            <ul className="list-disc pl-4 mt-2 text-sm text-gray-700">
              <li>Supported formats: PDF, JPG, PNG</li>
              <li>Max file size: 10MB</li>
              <li>Your records are encrypted and stored securely</li>
            </ul>
          </div>
          <div className="mt-4">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
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
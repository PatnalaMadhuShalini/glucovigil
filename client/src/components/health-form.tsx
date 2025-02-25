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
import { Loader2, AlertTriangle, FileUp, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Slider } from "@/components/ui/slider";

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 inline-block text-gray-400" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function HealthForm({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
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
        cholesterol: {
          total: 0,
          hdl: 0,
          ldl: 0,
        },
      },
      lifestyle: {
        smoking: false,
        alcohol: {
          consumption: "none",
          frequencyPerWeek: 0,
        },
        exercise: "none",
        diet: "fair",
        sleep: {
          hoursPerNight: 7,
          quality: "good",
        },
        stressLevel: "moderate",
        workStyle: "sedentary",
      },
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      // Update form with extracted data if available
      if (data.extractedData) {
        form.setValue('physiological', {
          ...form.getValues('physiological'),
          ...data.extractedData,
        });
      }

      toast({
        title: "Success",
        description: "Medical records processed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process medical records",
        variant: "destructive",
      });
    }
  }, [form, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const mutation = useMutation({
    mutationFn: async (data: HealthData) => {
      const res = await apiRequest("POST", "/api/health-data", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your health data has been saved",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const parseNumberInput = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6"
      >
        {/* Demographics Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Demographics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="demographics.age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <InfoTooltip content="Your current age in years" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
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
                  <InfoTooltip content="Your biological sex assigned at birth" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <InfoTooltip content="Your self-identified ethnicity or racial background" />
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Medical Records Upload Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Medical Records (Optional)
            <InfoTooltip content="Upload your recent medical records in PDF format. This helps us extract relevant health data automatically." />
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center space-y-2">
              <FileUp className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p>Drop the PDF file here</p>
                ) : (
                  <p>Drag and drop your medical records (PDF) here, or click to select</p>
                )}
              </div>
              <p className="text-xs text-gray-500">Only PDF files are supported</p>
            </div>
          </div>
        </div>

        {/* Physiological Data Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Physiological Data</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="physiological.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <InfoTooltip content="Your height in centimeters. To convert from feet: multiply feet by 30.48 and inches by 2.54" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Normal range: 150-200 cm for adults</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <InfoTooltip content="Your current weight in kilograms. To convert from pounds, divide by 2.205" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodPressure.systolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic BP</FormLabel>
                  <InfoTooltip content="The top number in your blood pressure reading, measured when your heart beats" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Normal range: 90-120 mmHg</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodPressure.diastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic BP</FormLabel>
                  <InfoTooltip content="The bottom number in your blood pressure reading, measured between heartbeats" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Normal range: 60-80 mmHg</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.bloodSugar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                  <InfoTooltip content="Your fasting blood glucose level. Measure after 8 hours of fasting" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Normal range: 70-100 mg/dL (fasting)</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.cholesterol.total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cholesterol (mg/dL)</FormLabel>
                  <InfoTooltip content="Your total cholesterol level from a lipid panel blood test" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Desirable: Less than 200 mg/dL</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.cholesterol.hdl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HDL Cholesterol (mg/dL)</FormLabel>
                  <InfoTooltip content="'Good' cholesterol - Higher levels are better" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Optimal: 60 mg/dL or higher</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physiological.cholesterol.ldl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LDL Cholesterol (mg/dL)</FormLabel>
                  <InfoTooltip content="'Bad' cholesterol - Lower levels are better" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Optimal: Less than 100 mg/dL</FormDescription>
                </FormItem>
              )}
            />
          </div>

          {/* Risk Alert */}
          {form.watch("physiological.bloodSugar") > 100 && (
            <Alert className="mt-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Elevated Blood Sugar</AlertTitle>
              <AlertDescription>
                Your blood sugar level is above the normal range. Consider consulting with a healthcare professional.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Lifestyle Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lifestyle</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="lifestyle.exercise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Level</FormLabel>
                  <InfoTooltip content="How often you engage in physical activity" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (No exercise)</SelectItem>
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
                  <InfoTooltip content="How would you rate the overall healthiness of your diet?" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
            {/* Sleep Section */}
            <FormField
              control={form.control}
              name="lifestyle.sleep.hoursPerNight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Hours per Night</FormLabel>
                  <InfoTooltip content="Average hours of sleep you get per night" />
                  <FormControl>
                    <div className="pt-2">
                      <Slider
                        min={4}
                        max={12}
                        step={0.5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="text-center mt-2">{field.value} hours</div>
                    </div>
                  </FormControl>
                  <FormDescription>Recommended: 7-9 hours for adults</FormDescription>
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
                  <InfoTooltip content="How would you rate the quality of your sleep?" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            {/* Alcohol Consumption */}
            <FormField
              control={form.control}
              name="lifestyle.alcohol.consumption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol Consumption</FormLabel>
                  <InfoTooltip content="Your typical alcohol consumption pattern" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="occasional">Occasional (Few times/month)</SelectItem>
                      <SelectItem value="moderate">Moderate (1-2 drinks/day)</SelectItem>
                      <SelectItem value="frequent">Frequent (3+ drinks/day)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lifestyle.alcohol.frequencyPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drinks per Week</FormLabel>
                  <InfoTooltip content="Average number of alcoholic drinks consumed per week" />
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Moderate: ≤14 drinks/week for men, ≤7 for women</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stress Level */}
            <FormField
              control={form.control}
              name="lifestyle.stressLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level</FormLabel>
                  <InfoTooltip content="Your perceived level of daily stress" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stress level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (Rarely stressed)</SelectItem>
                      <SelectItem value="moderate">Moderate (Sometimes stressed)</SelectItem>
                      <SelectItem value="high">High (Often stressed)</SelectItem>
                      <SelectItem value="severe">Severe (Constantly stressed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Style */}
            <FormField
              control={form.control}
              name="lifestyle.workStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Style</FormLabel>
                  <InfoTooltip content="Your typical daily activity level at work" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit Health Data
        </Button>

        {/* AI Assistant Tip */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800">AI Health Assistant</h3>
          <p className="text-sm text-blue-600 mt-1">
            Fill in your health data accurately to receive personalized recommendations. Our AI will analyze your data and provide tailored insights for better health management.
          </p>
        </div>
      </form>
    </Form>
  );
}
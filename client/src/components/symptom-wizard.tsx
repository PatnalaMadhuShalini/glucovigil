import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { symptomSchema, type Symptom } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Thermometer,
  Stethoscope,
  Brain,
  Heart,
  Wind,
  Grape,
  Activity
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Organize symptoms by category
const symptomCategories = {
  general: {
    title: "General",
    icon: Thermometer,
    symptoms: ["Fatigue", "Fever", "Weakness", "Chills"]
  },
  head: {
    title: "Head & Neurological",
    icon: Brain,
    symptoms: ["Headache", "Dizziness", "Confusion", "Blurred Vision"]
  },
  chest: {
    title: "Chest & Heart",
    icon: Heart,
    symptoms: ["Chest Pain", "Palpitations", "Shortness of Breath"]
  },
  respiratory: {
    title: "Respiratory",
    icon: Wind,
    symptoms: ["Cough", "Wheezing", "Difficulty Breathing"]
  },
  digestive: {
    title: "Digestive",
    icon: Grape,
    symptoms: ["Nausea", "Vomiting", "Abdominal Pain", "Diarrhea"]
  },
  musculoskeletal: {
    title: "Muscles & Joints",
    icon: Activity,
    symptoms: ["Joint Pain", "Muscle Ache", "Back Pain", "Stiffness"]
  }
};

const steps = [
  {
    title: "Primary Symptom",
    description: "What's your main symptom?",
  },
  {
    title: "Severity & Pattern",
    description: "How severe is it and what's the pattern?",
  },
  {
    title: "Duration & Timing",
    description: "When did it start and what time of day does it occur?",
  },
  {
    title: "Associated Factors",
    description: "What makes it better or worse?",
  }
];

interface SymptomWizardProps {
  onComplete?: () => void;
}

export default function SymptomWizard({ onComplete }: SymptomWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progress = ((currentStep + 1) / steps.length) * 100;

  // If not authenticated, show message
  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please login to track your symptoms.
        </AlertDescription>
      </Alert>
    );
  }

  const form = useForm<Symptom>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      severity: 5,
      pattern: "Constant", // Added default value for pattern
      timeOfDay: "variable",
      triggers: "",
      additionalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Symptom) => {
      const res = await apiRequest("POST", "/api/symptoms", {
        ...data,
        recordedAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Your symptoms have been recorded successfully",
      });
      if (onComplete) {
        onComplete();
      }
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

  const onSubmit = async (data: Symptom) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const nextStep = () => {
    const fields = [
      ["primarySymptom"],
      ["severity", "pattern"],
      ["duration", "timeOfDay"],
      ["triggers", "additionalNotes"],
    ][currentStep];

    form.trigger(fields as Array<keyof Symptom>).then((isValid) => {
      if (isValid) {
        setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              {Object.entries(symptomCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <FormField
                    key={key}
                    control={form.control}
                    name="primarySymptom"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <FormLabel className="text-lg font-medium">
                            {category.title}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid md:grid-cols-2 gap-2"
                          >
                            {category.symptoms.map((symptom) => (
                              <div key={symptom} className="flex items-center space-x-2">
                                <RadioGroupItem value={symptom} id={symptom} />
                                <Label htmlFor={symptom}>{symptom}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How severe is your symptom? (0-10)</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="py-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Mild</span>
                          <span>Moderate</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's the pattern of your symptom?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid md:grid-cols-2 gap-2"
                      >
                        {[
                          "Constant",
                          "Intermittent",
                          "Progressive",
                          "Cyclical",
                        ].map((pattern) => (
                          <div key={pattern} className="flex items-center space-x-2">
                            <RadioGroupItem value={pattern} id={pattern} />
                            <Label htmlFor={pattern}>{pattern}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How long have you had this symptom?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 2 days, 1 week" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When does it typically occur?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid md:grid-cols-2 gap-2"
                      >
                        {[
                          "morning",
                          "afternoon",
                          "evening",
                          "night",
                          "variable",
                        ].map((time) => (
                          <div key={time} className="flex items-center space-x-2">
                            <RadioGroupItem value={time} id={time} />
                            <Label htmlFor={time} className="capitalize">
                              {time}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="triggers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What triggers or worsens your symptom?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., physical activity, certain foods" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes or Observations</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Any other relevant information" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
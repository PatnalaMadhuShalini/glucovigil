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
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const steps = [
  {
    title: "Primary Symptom",
    description: "What's your main symptom?",
  },
  {
    title: "Severity",
    description: "How severe is your symptom?",
  },
  {
    title: "Duration & Timing",
    description: "When did it start and what time of day does it occur?",
  },
  {
    title: "Additional Details",
    description: "Any triggers or additional notes?",
  },
];

interface SymptomWizardProps {
  onComplete?: () => void;
}

export default function SymptomWizard({ onComplete }: SymptomWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const { toast } = useToast();

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
      timeOfDay: "variable",
      triggers: "",
      additionalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Symptom) => {
      setError(null);
      try {
        // Transform dates to ISO strings
        const formattedData = {
          ...data,
          recordedAt: new Date().toISOString(),
        };

        // Make three attempts to submit
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < 3) {
          try {
            const res = await apiRequest("POST", "/symptoms", formattedData);
            const responseData = await res.json();

            if (!res.ok) {
              throw new Error(responseData.message || "Failed to submit symptoms");
            }

            return responseData;
          } catch (err) {
            lastError = err as Error;
            attempt++;
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        throw lastError || new Error("Failed to submit symptoms after multiple attempts");
      } catch (error) {
        console.error("Mutation error:", error);
        throw error instanceof Error ? error : new Error("Failed to submit symptoms");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/health-data"] });
      toast({
        title: "Success",
        description: "Your symptoms have been recorded successfully",
      });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      console.error("Submit error:", error);
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
      console.log("Form submission data:", data);
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const nextStep = () => {
    const fields = [
      ["primarySymptom"],
      ["severity"],
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

        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
          <Progress value={progress} className="mt-2" />
        </div>

        <div className="space-y-4">
          {currentStep === 0 && (
            <FormField
              control={form.control}
              name="primarySymptom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your primary symptom</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid md:grid-cols-2 gap-4"
                    >
                      {[
                        "Fatigue",
                        "Headache",
                        "Dizziness",
                        "Nausea",
                        "Blurred Vision",
                        "Numbness",
                        "Chest Pain",
                        "Shortness of Breath",
                      ].map((symptom) => (
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
          )}

          {currentStep === 1 && (
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate the severity (0-10)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="py-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 2 && (
            <>
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
                        className="grid md:grid-cols-2 gap-4"
                      >
                        {["morning", "afternoon", "evening", "night", "variable"].map((time) => (
                          <div key={time} className="flex items-center space-x-2">
                            <RadioGroupItem value={time} id={time} />
                            <Label htmlFor={time} className="capitalize">{time}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {currentStep === 3 && (
            <>
              <FormField
                control={form.control}
                name="triggers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any known triggers?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., stress, certain foods" />
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
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Any other relevant information" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Separator />

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
            <Button
              type="button"
              onClick={nextStep}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
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
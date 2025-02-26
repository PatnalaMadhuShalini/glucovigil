import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const symptomSchema = z.object({
  primarySymptom: z.string().min(1, "Please select a primary symptom"),
  severity: z.number().min(0).max(10),
  duration: z.string().min(1, "Please specify the duration"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night", "variable"]),
  triggers: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type SymptomForm = z.infer<typeof symptomSchema>;

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
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const { toast } = useToast();

  const form = useForm<SymptomForm>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      severity: 5,
      timeOfDay: "variable",
      triggers: "",
      additionalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SymptomForm) => {
      console.log("Submitting data to API:", data);
      const res = await apiRequest("POST", "/api/symptoms", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save symptoms");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Symptoms recorded successfully",
      });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commonSymptoms = [
    "Fatigue",
    "Headache",
    "Dizziness",
    "Nausea",
    "Blurred Vision",
    "Numbness",
    "Chest Pain",
    "Shortness of Breath",
  ];

  const onSubmit = async (data: SymptomForm) => {
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

    form.trigger(fields as Array<keyof SymptomForm>).then((isValid) => {
      if (isValid) {
        setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Symptom Tracker</span>
          <span className="text-sm font-normal text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {currentStep === 0 && (
              <div className="space-y-4">
                <Label>Select your primary symptom</Label>
                <RadioGroup
                  value={form.getValues("primarySymptom")}
                  onValueChange={(value) => form.setValue("primarySymptom", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {commonSymptoms.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <RadioGroupItem value={symptom} id={symptom} />
                      <Label htmlFor={symptom}>{symptom}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {form.formState.errors.primarySymptom && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.primarySymptom.message}
                  </p>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <Label>Rate the severity (0-10)</Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  defaultValue={[form.getValues("severity")]}
                  onValueChange={([value]) => form.setValue("severity", value)}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>How long have you had this symptom?</Label>
                  <Input
                    {...form.register("duration")}
                    placeholder="e.g., 2 days, 1 week"
                    className="mt-2"
                  />
                  {form.formState.errors.duration && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.duration.message}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Label>When does it typically occur?</Label>
                  <RadioGroup
                    value={form.getValues("timeOfDay")}
                    onValueChange={(value) => form.setValue("timeOfDay", value as any)}
                    className="grid grid-cols-2 gap-4 mt-2"
                  >
                    {["morning", "afternoon", "evening", "night", "variable"].map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem value={time} id={time} />
                        <Label htmlFor={time} className="capitalize">{time}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Any known triggers?</Label>
                  <Input
                    {...form.register("triggers")}
                    placeholder="e.g., stress, certain foods"
                    className="mt-2"
                  />
                </div>
                <div className="mt-4">
                  <Label>Additional Notes</Label>
                  <Input
                    {...form.register("additionalNotes")}
                    placeholder="Any other relevant information"
                    className="mt-2"
                  />
                </div>
              </div>
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
                  <>Submitting...</>
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
      </CardContent>
    </Card>
  );
}
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Check, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MedicalRecordsUpload() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest("POST", "/api/medical-records", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
      toast({
        title: "Success",
        description: "Medical records uploaded and analyzed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      mutation.mutate(acceptedFiles[0]);
    }
  }, [mutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Medical Records Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the PDF here...</p>
          ) : (
            <p className="text-muted-foreground">
              Drag and drop your medical records PDF here, or click to select
            </p>
          )}
          <Button variant="outline" className="mt-4">
            Select File
          </Button>
        </div>

        {mutation.isPending && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analyzing medical records...
            </AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Medical records analyzed successfully. Your health data has been updated.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

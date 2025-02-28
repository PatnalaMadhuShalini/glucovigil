import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function DocumentationPage() {
  const [abstract, setAbstract] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch the markdown file
    fetch("/glucosmart-abstract.md")
      .then(response => response.text())
      .then(text => {
        setAbstract(text);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading documentation:", error);
        setLoading(false);
      });
  }, []);

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    // Convert headers
    let html = markdown
      .replace(/# (.*$)/gim, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/## (.*$)/gim, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="abstract">Project Abstract</TabsTrigger>
            <TabsTrigger value="usecases">Use Case Diagram</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}

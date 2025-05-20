"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, AlertTriangle, Sparkles } from "lucide-react";
import { analyzeCase, type AnalyzeCaseInput, type AnalyzeCaseOutput } from "@/ai/flows/case-analyzer";

const formSchema = z.object({
  caseDescription: z.string().min(50, { message: "A descrição do caso deve ter pelo menos 50 caracteres." }).max(5000, { message: "A descrição do caso não pode exceder 5000 caracteres." }),
});

type CaseAnalyzerFormValues = z.infer<typeof formSchema>;

export function CaseAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CaseAnalyzerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseDescription: "",
    },
  });

  const onSubmit: SubmitHandler<CaseAnalyzerFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const input: AnalyzeCaseInput = { caseDescription: data.caseDescription };
      const result = await analyzeCase(input);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao analisar o caso. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Analisador de Caso</CardTitle>
          <CardDescription>
            Insira a descrição do seu caso e a IA identificará os pontos chave e informações relevantes.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="caseDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="caseDescription">Descrição do Caso</FormLabel>
                    <FormControl>
                      <Textarea
                        id="caseDescription"
                        placeholder="Descreva detalhadamente os fatos, partes envolvidas, e o objeto da ação..."
                        rows={10}
                        className="text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analisar Caso
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Erro na Análise</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Analisando...</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2 text-primary">Pontos Relevantes Identificados:</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert bg-muted p-4 rounded-md">
              <p style={{ whiteSpace: 'pre-wrap' }}>{analysisResult.relevantPoints}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

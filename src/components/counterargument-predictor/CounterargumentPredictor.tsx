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
import { Loader2, MessagesSquare, AlertTriangle, Wand2 } from "lucide-react";
import { predictCounterarguments, type PredictCounterargumentsInput, type PredictCounterargumentsOutput } from "@/ai/flows/counterargument-predictor";

const formSchema = z.object({
  caseDescription: z.string().min(50, { message: "A descrição do caso deve ter pelo menos 50 caracteres." }).max(5000, { message: "A descrição do caso não pode exceder 5000 caracteres." }),
});

type CounterargumentFormValues = z.infer<typeof formSchema>;

export function CounterargumentPredictor() {
  const [predictionResult, setPredictionResult] = useState<PredictCounterargumentsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CounterargumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseDescription: "",
    },
  });

  const onSubmit: SubmitHandler<CounterargumentFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const input: PredictCounterargumentsInput = { caseDescription: data.caseDescription };
      const result = await predictCounterarguments(input);
      setPredictionResult(result);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao prever os contra-argumentos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><MessagesSquare className="h-6 w-6 text-primary" />Preditor de Contra-Argumentos</CardTitle>
          <CardDescription>
            Forneça os detalhes do seu caso e a IA irá sugerir possíveis contra-argumentos com base em leis e jurisprudência.
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
                        placeholder="Descreva a tese principal, os fatos e argumentos da parte contrária (se conhecidos)..."
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
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Prever Contra-Argumentos
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Erro na Predição</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Processando...</p>
        </div>
      )}

      {predictionResult && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Contra-Argumentos Potenciais</CardTitle>
          </CardHeader>
          <CardContent>
            {predictionResult.counterarguments && predictionResult.counterarguments.length > 0 ? (
              <ul className="space-y-3 list-disc list-inside bg-muted p-4 rounded-md">
                {predictionResult.counterarguments.map((arg, index) => (
                  <li key={index} className="text-sm leading-relaxed">{arg}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum contra-argumento específico foi identificado para esta descrição.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

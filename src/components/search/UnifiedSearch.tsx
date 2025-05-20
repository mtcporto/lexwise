
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResultCard, type SearchResultItem } from "./SearchResultCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, Loader2, AlertTriangle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { searchLexml, type LexmlSearchInput } from "@/ai/flows/lexml-search-flow";

// Mock data for sources other than LexML (if needed in future)
const mockOtherResults: SearchResultItem[] = [
  {
    id: "senado-1",
    title: "Lei Complementar nº 101/2000 (LRF) - Exemplo Senado",
    source: "Senado Federal",
    description: "Exemplo: Estabelece normas de finanças públicas voltadas para a responsabilidade na gestão fiscal.",
    url: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm",
    type: "Lei Complementar",
    date: "04/05/2000",
  },
  {
    id: "camara-1",
    title: "PL 2630/2020 - Exemplo Câmara",
    source: "Câmara dos Deputados",
    description: "Exemplo: Institui a Lei Brasileira de Liberdade, Responsabilidade e Transparência na Internet.",
    url: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2256750",
    type: "Projeto de Lei",
    date: "2020",
  },
];

export function UnifiedSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataSource, setDataSource] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setError("Por favor, insira um termo de busca.");
      setResults([]);
      setSearched(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearched(true);
    setResults([]); // Clear previous results

    try {
      let fetchedResults: SearchResultItem[] = [];
      if (dataSource === "lexml" || dataSource === "all") {
        const input: LexmlSearchInput = { query: searchTerm };
        const lexmlOutput = await searchLexml(input);
        fetchedResults = [...fetchedResults, ...lexmlOutput.results];
      }
      
      // Placeholder for other data sources when "all" is selected or they are specifically chosen
      if (dataSource === "all") {
        // You could merge with other mock/real sources here
        // For now, mockOtherResults are not actively filtered by searchTerm if 'all' and LexML is used
        // fetchedResults = [...fetchedResults, ...mockOtherResults.filter(r => dataSource === "all" || r.source.toLowerCase().replace(/\s+/g, '').includes(dataSource.toLowerCase()))];
      } else if (dataSource !== "lexml") {
        // For specific sources not yet implemented, show mock or empty
         const mockForSource = mockOtherResults.filter(r => r.source.toLowerCase().replace(/\s+/g, '').includes(dataSource.toLowerCase()));
         fetchedResults = mockForSource.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()));

        if (fetchedResults.length === 0 && mockForSource.length > 0) {
            // If mock data for the source exists but doesn't match term
             // setError(`Nenhum resultado encontrado em ${dataSource} para "${searchTerm}".`);
        } else if (mockForSource.length === 0) {
            // If no mock data/implementation for the source
            // setError(`Busca em ${dataSource} ainda não implementada.`);
        }
      }
      
      setResults(fetchedResults);

    } catch (e) {
      console.error("Search error:", e);
      setError("Ocorreu um erro ao realizar a busca. Tente novamente.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pesquisa Jurídica Unificada</CardTitle>
          <CardDescription>
            Busque em leis, projetos, jurisprudência e mais. A busca no LexML Brasil está ativa. Outras fontes podem usar dados de exemplo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Digite termos, nº da lei, ementa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-base"
              aria-label="Termo de busca"
            />
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Fonte de Dados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                <SelectItem value="lexml">LexML Brasil</SelectItem>
                <SelectItem value="senado">Senado Federal (Exemplo)</SelectItem>
                <SelectItem value="camara">Câmara dos Deputados (Exemplo)</SelectItem>
                <SelectItem value="cnj">CNJ DataJud (Exemplo)</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Erro na Busca</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Buscando...</p>
        </div>
      )}

      {!isLoading && searched && results.length === 0 && !error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Nenhum Resultado Encontrado</AlertTitle>
          <AlertDescription>
            Tente refinar seus termos de busca ou selecionar outra fonte de dados.
            A busca no LexML foi realizada. Para outras fontes, os resultados são exemplos ou a integração pode não estar completa.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados da Busca ({results.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}
       {!isLoading && !searched && !error && (
         <Alert variant="default" className="border-primary/50">
           <Info className="h-4 w-4 text-primary" />
           <AlertTitle className="text-primary">Comece sua pesquisa</AlertTitle>
           <AlertDescription>
             Utilize o campo de busca acima. A busca no LexML Brasil está integrada.
             Outras fontes podem retornar dados de exemplo ou demonstrativos.
           </AlertDescription>
         </Alert>
      )}
    </div>
  );
}


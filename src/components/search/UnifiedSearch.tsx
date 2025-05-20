
"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResultCard, type SearchResultItem } from "./SearchResultCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, Loader2, AlertTriangle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { searchLexml, type LexmlSearchInput } from "@/ai/flows/lexml-search-flow";
import { searchSenado, type SenadoSearchInput } from "@/ai/flows/senado-search-flow";
import { searchCamara, type CamaraSearchInput } from "@/ai/flows/camara-search-flow";
import { searchCnj, type CnjSearchInput } from "@/ai/flows/cnj-search-flow";

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
    setResults([]); 

    try {
      let fetchedResults: SearchResultItem[] = [];
      const promises: Promise<{results: SearchResultItem[]}>[] = [];

      if (dataSource === "lexml" || dataSource === "all") {
        const input: LexmlSearchInput = { query: searchTerm };
        promises.push(searchLexml(input));
      }
      if (dataSource === "senado" || dataSource === "all") {
        const input: SenadoSearchInput = { query: searchTerm };
        promises.push(searchSenado(input));
      }
      if (dataSource === "camara" || dataSource === "all") {
        const input: CamaraSearchInput = { query: searchTerm };
        promises.push(searchCamara(input));
      }
      if (dataSource === "cnj" || dataSource === "all") {
        const input: CnjSearchInput = { query: searchTerm };
        promises.push(searchCnj(input));
      }
      
      const allResultsSettled = await Promise.allSettled(promises);
      
      allResultsSettled.forEach(settledResult => {
        if (settledResult.status === 'fulfilled' && settledResult.value.results) {
          fetchedResults = [...fetchedResults, ...settledResult.value.results];
        } else if (settledResult.status === 'rejected') {
          console.error("A search promise was rejected:", settledResult.reason);
          // Optionally, set a partial error message
        }
      });
      
      // Deduplicate results based on a combination of title and source, or a more robust ID if available.
      // This is a simple deduplication, might need refinement.
      const uniqueResults = fetchedResults.reduce((acc, current) => {
        const x = acc.find(item => item.title === current.title && item.source === current.source && item.url === current.url);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as SearchResultItem[]);


      setResults(uniqueResults);

      if (uniqueResults.length === 0) {
         // No specific error, but no results found from any source
         // The individual flows might console.error issues
      }

    } catch (e) {
      console.error("Search error in UnifiedSearch component:", e);
      setError("Ocorreu um erro ao realizar a busca. Verifique o console para mais detalhes ou tente novamente.");
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
            Busque em tempo real em diversas fontes de dados jurídicos como LexML Brasil, Senado Federal, Câmara dos Deputados e CNJ DataJud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="Digite termos, nº da lei, ementa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (error) setError(null); // Clear error on new input
              }}
              className="flex-grow text-base"
              aria-label="Termo de busca"
            />
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-full sm:w-[200px]"> {/* Increased width for longer names */}
                <SelectValue placeholder="Fonte de Dados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                <SelectItem value="lexml">LexML Brasil</SelectItem>
                <SelectItem value="senado">Senado Federal</SelectItem>
                <SelectItem value="camara">Câmara dos Deputados</SelectItem>
                <SelectItem value="cnj">CNJ DataJud</SelectItem>
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
          <p className="ml-4 text-lg text-muted-foreground">Buscando em fontes externas...</p>
        </div>
      )}

      {!isLoading && searched && results.length === 0 && !error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Nenhum Resultado Encontrado</AlertTitle>
          <AlertDescription>
            Sua busca por "{searchTerm}" em "{dataSource === 'all' ? 'Todas as Fontes' : dataSource}" não retornou resultados.
            Tente refinar seus termos de busca ou selecionar outra fonte de dados.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados da Busca ({results.length}) para "{searchTerm}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result) => (
              <SearchResultCard key={`${result.source}-${result.id}`} result={result} />
            ))}
          </div>
        </div>
      )}
       {!isLoading && !searched && !error && (
         <Alert variant="default" className="border-primary/50">
           <Info className="h-4 w-4 text-primary" />
           <AlertTitle className="text-primary">Comece sua pesquisa</AlertTitle>
           <AlertDescription>
             Utilize o campo de busca acima para consultar informações jurídicas em diversas fontes de dados abertos.
           </AlertDescription>
         </Alert>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResultCard, type SearchResultItem } from "./SearchResultCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, Loader2, AlertTriangle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data - replace with actual API calls
const mockResults: SearchResultItem[] = [
  {
    id: "1",
    title: "Lei Complementar nº 101/2000 (Lei de Responsabilidade Fiscal)",
    source: "Senado Federal",
    description: "Estabelece normas de finanças públicas voltadas para a responsabilidade na gestão fiscal e dá outras providências.",
    url: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp101.htm",
    type: "Lei Complementar",
    date: "04/05/2000",
  },
  {
    id: "2",
    title: "PL 2630/2020 - Lei das Fake News",
    source: "Câmara dos Deputados",
    description: "Institui a Lei Brasileira de Liberdade, Responsabilidade e Transparência na Internet.",
    url: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2256750",
    type: "Projeto de Lei",
    date: "2020",
  },
  {
    id: "3",
    title: "Estatísticas de Processos - TJSP",
    source: "CNJ DataJud",
    description: "Dados estatísticos sobre o volume e classes de processos no Tribunal de Justiça de São Paulo.",
    url: "https://datajud-wiki.cnj.jus.br/api-publica/",
    type: "Dados Estatísticos",
  },
  {
    id: "4",
    title: "Constituição Federal de 1988",
    source: "LexML Brasil",
    description: "Texto integral da Constituição da República Federativa do Brasil de 1988.",
    url: "http://www.lexml.gov.br/urn/urn:lex:br:federal:constituicao:1988-10-05;1988",
    type: "Constituição",
    date: "05/10/1988",
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
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Filter mock results based on search term (simple includes check) and data source
    const filteredResults = mockResults.filter(result => 
      (result.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       result.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (dataSource === "all" || result.source.toLowerCase().replace(/\s+/g, '').includes(dataSource.toLowerCase()))
    );
    
    setResults(filteredResults);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pesquisa Jurídica Unificada</CardTitle>
          <CardDescription>
            Busque em leis, projetos, jurisprudência (estatísticas) e mais, em diversas fontes públicas.
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
                <SelectItem value="senado">Senado Federal</SelectItem>
                <SelectItem value="camara">Câmara dos Deputados</SelectItem>
                <SelectItem value="cnj">CNJ DataJud</SelectItem>
                <SelectItem value="lexml">LexML Brasil</SelectItem>
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
             Utilize o campo de busca acima para encontrar informações legais relevantes. 
             A busca atual é uma simulação e retornará dados de exemplo.
           </AlertDescription>
         </Alert>
      )}
    </div>
  );
}

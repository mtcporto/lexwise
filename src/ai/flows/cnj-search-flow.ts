
'use server';
/**
 * @fileOverview Searches CNJ DataJud API.
 * This flow attempts to use the public CNJ DataJud API to search for processual data.
 *
 * - searchCnj - A function that handles searching CNJ DataJud.
 * - CnjSearchInput - The input type for the searchCnj function.
 * - CnjSearchOutput - The return type for the searchCnj function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SearchResultItem } from '@/components/search/SearchResultCard';

const CnjSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  description: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
});

const CnjSearchInputSchema = z.object({
  query: z.string().describe('The search query for CNJ DataJud.'),
});
export type CnjSearchInput = z.infer<typeof CnjSearchInputSchema>;

const CnjSearchOutputSchema = z.object({
  results: z.array(CnjSearchResultSchema).describe('The search results from CNJ DataJud.'),
});
export type CnjSearchOutput = z.infer<typeof CnjSearchOutputSchema>;

// API Key provided by the user. In a production app, this should come from environment variables.
const CNJ_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

export async function searchCnj(input: CnjSearchInput): Promise<CnjSearchOutput> {
  return searchCnjFlow(input);
}

const searchCnjFlow = ai.defineFlow(
  {
    name: 'searchCnjFlow',
    inputSchema: CnjSearchInputSchema,
    outputSchema: CnjSearchOutputSchema,
  },
  async (input) => {
    const baseUrl = 'https://api-publica.datajud.cnj.jus.br/servico-de-consulta-processual/v2/consulta_processual';
    const queryParams = new URLSearchParams({
      query: input.query,
      size: '25', // Increased size from 10 to 25
    });
    const url = `${baseUrl}?${queryParams.toString()}`;
    const cnjSearchPortalUrl = `https://www.cnj.jus.br/busca-geral/?termo=${encodeURIComponent(input.query)}`;

    const baseInformationalResult = {
      id: `cnj-info-${Date.now()}-${Math.random()}`, // Added Math.random for better uniqueness
      title: `Consultar "${input.query}" no portal do CNJ`,
      source: 'CNJ DataJud',
      url: cnjSearchPortalUrl,
      type: 'Link para Portal de Busca',
      date: new Date().toLocaleDateString('pt-BR'),
    };

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `APIKey ${CNJ_API_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const status = response.status;
        console.error(`CNJ DataJud API error for query "${input.query}": ${status} ${response.statusText}`, errorBody);
        
        let description = `Tentamos consultar a API do DataJud para "${input.query}", mas ocorreu um erro (código: ${status}).`;
        if (status === 404) {
          description += ` O recurso solicitado não foi encontrado na API. Isso pode indicar um problema com o endpoint da API ou sua consulta específica.`;
        } else if (status === 401 || status === 403) {
          description += ` Falha na autorização ao acessar a API. Verifique se a chave da API é válida e tem permissão para este serviço.`;
        } else {
          description += ` A API do DataJud pode estar temporariamente indisponível ou retornou um erro inesperado.`;
        }
        description += ` Você pode tentar sua busca diretamente no portal do CNJ.`;
        
        return { results: [{ ...baseInformationalResult, description }] };
      }

      const jsonResponse = await response.json();
      const searchResults: SearchResultItem[] = [];

      if (jsonResponse.hits && jsonResponse.hits.hits && jsonResponse.hits.hits.length > 0) {
        for (const item of jsonResponse.hits.hits) {
          if (item._source) {
            const numeroProcesso = item._source.numeroProcesso;
            const dataAjuizamento = item._source.dataAjuizamento 
              ? new Date(item._source.dataAjuizamento).toLocaleDateString('pt-BR') 
              : 'N/A';
            
            searchResults.push({
              id: item._id || numeroProcesso || `cnj-item-${Date.now()}-${Math.random()}`,
              title: `Processo: ${numeroProcesso || 'Número indisponível'}`,
              source: 'CNJ DataJud',
              description: `Classe: ${item._source.classeProcessual || 'N/A'}. Tribunal: ${item._source.tribunal || 'N/A'}. Órgão Julgador: ${item._source.orgaoJulgador?.nomeOrgao || 'N/A'}. Data Ajuizamento: ${dataAjuizamento}.`,
              url: numeroProcesso ? `https://www.cnj.jus.br/busca-geral/?termo=${encodeURIComponent(numeroProcesso)}` : cnjSearchPortalUrl,
              type: item._source.classeProcessual || 'Processo Judicial',
              date: dataAjuizamento !== 'N/A' ? dataAjuizamento : undefined,
            });
          }
        }
        if (searchResults.length > 0) {
            return { results: searchResults };
        }
      }
      
      // No results from API or no usable items, return informational message
      const description = `A busca por "${input.query}" na API do DataJud não retornou resultados diretos. Tente refinar sua busca ou utilize o link para pesquisar no portal do CNJ.`;
      return { results: [{ ...baseInformationalResult, description }] };

    } catch (error: any) {
      console.error(`Failed to fetch or parse CNJ DataJud data for query "${input.query}":`, error);
      const description = `Não foi possível conectar à API do DataJud (Erro: ${error.message || 'desconhecido'}). Você pode tentar sua busca diretamente no portal do CNJ.`;
      return { results: [{ ...baseInformationalResult, description }] };
    }
  }
);

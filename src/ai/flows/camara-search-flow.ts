
'use server';
/**
 * @fileOverview Searches Câmara dos Deputados API.
 *
 * - searchCamara - A function that handles searching the Câmara dos Deputados API.
 * - CamaraSearchInput - The input type for the searchCamara function.
 * - CamaraSearchOutput - The return type for the searchCamara function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SearchResultItem } from '@/components/search/SearchResultCard';

const CamaraSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  description: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
});

const CamaraSearchInputSchema = z.object({
  query: z.string().describe('The search query for Câmara dos Deputados.'),
});
export type CamaraSearchInput = z.infer<typeof CamaraSearchInputSchema>;

const CamaraSearchOutputSchema = z.object({
  results: z.array(CamaraSearchResultSchema).describe('The search results from Câmara dos Deputados.'),
});
export type CamaraSearchOutput = z.infer<typeof CamaraSearchOutputSchema>;

export async function searchCamara(input: CamaraSearchInput): Promise<CamaraSearchOutput> {
  return searchCamaraFlow(input);
}

const searchCamaraFlow = ai.defineFlow(
  {
    name: 'searchCamaraFlow',
    inputSchema: CamaraSearchInputSchema,
    outputSchema: CamaraSearchOutputSchema,
  },
  async (input) => {
    const baseUrl = 'https://dadosabertos.camara.leg.br/api/v2/proposicoes';
    const queryParams = new URLSearchParams({
      keywords: input.query,
      ordenarPor: 'ano', // Example ordering
      ordem: 'DESC',
      itens: '10', // Limit results
    });
    const url = `${baseUrl}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Câmara API error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error body:', errorBody);
        return { results: [] };
      }

      const jsonResponse = await response.json();
      const searchResults: SearchResultItem[] = [];

      if (jsonResponse.dados) {
        for (const item of jsonResponse.dados) {
          const id = item.id?.toString() || `camara-${Date.now()}-${Math.random()}`;
          const title = `${item.siglaTipo} ${item.numero}/${item.ano}` || 'Título não disponível';
          const description = item.ementa || 'Descrição não disponível.';
          // The main 'uri' links to the API endpoint for the item, not necessarily a human-readable page.
          // We might need to find a better URL or construct one.
          // Example: Use the item.id to link to a detail page on the Camara portal if such a pattern exists.
          // For now, use the API URI, or a generic search link.
          const itemUrl = item.uri || `https://www.camara.leg.br/busca-portal/?contextoBusca=Busca%20Proposi%C3%A7%C3%B5es&termo=${encodeURIComponent(title)}`;
          const type = item.siglaTipo || 'Tipo não informado';
          const date = item.dataApresentacao ? new Date(item.dataApresentacao).toLocaleDateString('pt-BR') : undefined;

          searchResults.push({
            id,
            title,
            source: 'Câmara dos Deputados',
            description,
            url: itemUrl,
            type,
            date,
          });
        }
      }
      
      return { results: searchResults };

    } catch (error) {
      console.error('Failed to fetch or parse Câmara dos Deputados data:', error);
      return { results: [] };
    }
  }
);


'use server';
/**
 * @fileOverview Searches Senado Federal API.
 *
 * - searchSenado - A function that handles searching the Senado Federal API.
 * - SenadoSearchInput - The input type for the searchSenado function.
 * - SenadoSearchOutput - The return type for the searchSenado function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SearchResultItem } from '@/components/search/SearchResultCard'; // Assuming this path is correct

const SenadoSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  description: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
});

const SenadoSearchInputSchema = z.object({
  query: z.string().describe('The search query for Senado Federal.'),
});
export type SenadoSearchInput = z.infer<typeof SenadoSearchInputSchema>;

const SenadoSearchOutputSchema = z.object({
  results: z.array(SenadoSearchResultSchema).describe('The search results from Senado Federal.'),
});
export type SenadoSearchOutput = z.infer<typeof SenadoSearchOutputSchema>;

export async function searchSenado(input: SenadoSearchInput): Promise<SenadoSearchOutput> {
  return searchSenadoFlow(input);
}

const searchSenadoFlow = ai.defineFlow(
  {
    name: 'searchSenadoFlow',
    inputSchema: SenadoSearchInputSchema,
    outputSchema: SenadoSearchOutputSchema,
  },
  async (input) => {
    const baseUrl = 'https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista';
    const queryParams = new URLSearchParams({
      palavraChave: input.query,
      // itens: '10', // Limit results if needed
    });
    const url = `${baseUrl}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json', // Request JSON response
        },
      });

      if (!response.ok) {
        console.error(`Senado API error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error body:', errorBody);
        return { results: [] };
      }

      const jsonResponse = await response.json();
      const searchResults: SearchResultItem[] = [];

      if (jsonResponse.PesquisaBasicaMateria?.Materias?.Materia) {
        const materias = Array.isArray(jsonResponse.PesquisaBasicaMateria.Materias.Materia)
          ? jsonResponse.PesquisaBasicaMateria.Materias.Materia
          : [jsonResponse.PesquisaBasicaMateria.Materias.Materia];

        for (const item of materias) {
          const id = item.IdentificacaoMateria?.CodigoMateria?.toString() || `senado-${Date.now()}-${Math.random()}`;
          const title = item.IdentificacaoMateria?.DescricaoIdentificacaoMateria || 'Título não disponível';
          const description = item.EmentaMateria || 'Descrição não disponível.';
          const type = item.IdentificacaoMateria?.DescricaoSubtipoMateria || 'Tipo não informado';
          const date = item.DadosBasicosMateria?.DataApresentacao || undefined;
          // Construct URL if possible, e.g., using item.IdentificacaoMateria.CodigoMateria for a detail page
          // For now, we'll use a generic link or leave it empty
          const itemUrl = `https://www.congressonacional.leg.br/materias/pesquisa?termo=${encodeURIComponent(title)}`;


          searchResults.push({
            id,
            title,
            source: 'Senado Federal',
            description,
            url: itemUrl,
            type,
            date,
          });
        }
      }
      
      return { results: searchResults.slice(0, 10) }; // Limit to 10 results for now

    } catch (error) {
      console.error('Failed to fetch or parse Senado Federal data:', error);
      return { results: [] };
    }
  }
);

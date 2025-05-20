
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

// Helper function to fetch detailed proposition info and extract a user-friendly URL
async function fetchPropositionDetails(propositionUri: string): Promise<{friendlyUrl?: string; ementa?: string; dataApresentacao?: string }> {
  try {
    const response = await fetch(propositionUri, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.error(`Câmara API detail error for ${propositionUri}: ${response.status} ${response.statusText}`);
      return {};
    }
    const detailJson = await response.json();
    const urlInteiroTeor = detailJson.dados?.urlInteiroTeor;
    const statusUrl = detailJson.dados?.statusProposicao?.url;
    const ementa = detailJson.dados?.ementa;
    const dataApresentacao = detailJson.dados?.dataApresentacao;

    return { 
      friendlyUrl: urlInteiroTeor || statusUrl,
      ementa,
      dataApresentacao
    };
  } catch (error) {
    console.error(`Failed to fetch or parse proposition details from ${propositionUri}:`, error);
    return {};
  }
}


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
      ordenarPor: 'ano', 
      ordem: 'DESC',
      itens: '10', 
    });
    const url = `${baseUrl}?${queryParams.toString()}`;

    try {
      const listResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!listResponse.ok) {
        console.error(`Câmara API list error: ${listResponse.status} ${listResponse.statusText}`);
        const errorBody = await listResponse.text();
        console.error('Error body:', errorBody);
        return { results: [] };
      }

      const listJson = await listResponse.json();
      const searchResultsPromises: Promise<SearchResultItem | null>[] = [];

      if (listJson.dados) {
        for (const item of listJson.dados) {
          searchResultsPromises.push(
            (async (): Promise<SearchResultItem | null> => {
              try {
                const { friendlyUrl, ementa: detailEmenta, dataApresentacao: detailDataApresentacao } = await fetchPropositionDetails(item.uri);
                
                const id = item.id?.toString() || `camara-${Date.now()}-${Math.random()}`;
                const title = `${item.siglaTipo} ${item.numero}/${item.ano}` || 'Título não disponível';
                const description = detailEmenta || item.ementa || 'Descrição não disponível.';
                const itemUrl = friendlyUrl || item.uri || `https://www.camara.leg.br/busca-portal/?contextoBusca=Busca%20Proposi%C3%A7%C3%B5es&termo=${encodeURIComponent(title)}`;
                const type = item.siglaTipo || 'Tipo não informado';
                
                const dateSource = detailDataApresentacao || item.dataApresentacao;
                const date = dateSource ? new Date(dateSource).toLocaleDateString('pt-BR') : undefined;

                return {
                  id,
                  title,
                  source: 'Câmara dos Deputados',
                  description,
                  url: itemUrl,
                  type,
                  date,
                };
              } catch (detailError) {
                console.error(`Error processing item ${item.id}:`, detailError);
                // Fallback to basic info if detail fetch fails
                const id = item.id?.toString() || `camara-${Date.now()}-${Math.random()}`;
                const title = `${item.siglaTipo} ${item.numero}/${item.ano}` || 'Título não disponível';
                const description = item.ementa || 'Descrição não disponível.';
                const itemUrl = item.uri || `https://www.camara.leg.br/busca-portal/?contextoBusca=Busca%20Proposi%C3%A7%C3%B5es&termo=${encodeURIComponent(title)}`;
                const type = item.siglaTipo || 'Tipo não informado';
                const date = item.dataApresentacao ? new Date(item.dataApresentacao).toLocaleDateString('pt-BR') : undefined;
                return { id, title, source: 'Câmara dos Deputados', description, url: itemUrl, type, date };
              }
            })()
          );
        }
      }
      
      const resolvedResults = (await Promise.all(searchResultsPromises)).filter(r => r !== null) as SearchResultItem[];
      return { results: resolvedResults };

    } catch (error) {
      console.error('Failed to fetch or parse Câmara dos Deputados list data:', error);
      return { results: [] };
    }
  }
);


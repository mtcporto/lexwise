
'use server';
/**
 * @fileOverview Searches LexML via its SRU API.
 *
 * - searchLexml - A function that handles searching LexML.
 * - LexmlSearchInput - The input type for the searchLexml function.
 * - LexmlSearchOutput - The return type for the searchLexml function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Matches the structure of SearchResultItem in the frontend
const LexmlSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  description: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
});
export type LexmlSearchResult = z.infer<typeof LexmlSearchResultSchema>;

const LexmlSearchInputSchema = z.object({
  query: z.string().describe('The search query for LexML.'),
});
export type LexmlSearchInput = z.infer<typeof LexmlSearchInputSchema>;

const LexmlSearchOutputSchema = z.object({
  results: z.array(LexmlSearchResultSchema).describe('The search results from LexML.'),
});
export type LexmlSearchOutput = z.infer<typeof LexmlSearchOutputSchema>;

// Helper to extract content from an XML tag
function extractTagContent(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim();
}

// Helper to extract attribute from an XML tag
function extractAttribute(xml: string, tagName: string, attributeName: string): string | undefined {
  const tagRegex = new RegExp(`<${tagName}[^>]*>`, 'i');
  const tagMatch = xml.match(tagRegex);
  if (tagMatch) {
    const attributeRegex = new RegExp(`${attributeName}=["']([^"']+)["']`, 'i');
    const attributeMatch = tagMatch[0].match(attributeRegex);
    return attributeMatch?.[1];
  }
  return undefined;
}

export async function searchLexml(input: LexmlSearchInput): Promise<LexmlSearchOutput> {
  return searchLexmlFlow(input);
}

const searchLexmlFlow = ai.defineFlow(
  {
    name: 'searchLexmlFlow',
    inputSchema: LexmlSearchInputSchema,
    outputSchema: LexmlSearchOutputSchema,
  },
  async (input) => {
    const baseUrl = 'https://www.lexml.gov.br/busca/SRU';
    // Using cql.serverChoice for a general query, and requesting Dublin Core schema
    const queryParams = new URLSearchParams({
      operation: 'searchRetrieve',
      query: `cql.serverChoice all "${input.query}"`,
      maximumRecords: '10', // Limiting to 10 records for now
      recordSchema: 'dc', 
    });
    const url = `${baseUrl}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        console.error(`LexML API error: ${response.status} ${response.statusText}`);
        // Return empty results on error or throw, depending on desired error handling
        return { results: [] };
      }

      const xmlText = await response.text();
      const searchResults: LexmlSearchResult[] = [];

      // Basic XML parsing using string manipulation / regex
      // This is fragile and a proper XML parser would be better in a production environment
      const recordMatches = xmlText.matchAll(/<record>([\s\S]*?)<\/record>/gi);

      for (const recordMatch of recordMatches) {
        const recordXml = recordMatch[1];
        
        const rdfDescriptionXml = extractTagContent(recordXml, 'rdf:Description');
        if (!rdfDescriptionXml) continue;

        const id = extractAttribute(rdfDescriptionXml, 'rdf:Description', 'rdf:about') || `lexml-${Date.now()}-${Math.random()}`;
        const title = extractTagContent(rdfDescriptionXml, 'dc:title') || 'Título não encontrado';
        let description = extractTagContent(rdfDescriptionXml, 'dc:description') || 'Descrição não disponível.';
        // Sometimes description might be inside a subject tag if dc:description is missing
        if (description === 'Descrição não disponível.') {
          description = extractTagContent(rdfDescriptionXml, 'dc:subject') || 'Descrição não disponível.';
        }
        const urlLink = extractTagContent(rdfDescriptionXml, 'dc:identifier')?.startsWith('http') 
                        ? extractTagContent(rdfDescriptionXml, 'dc:identifier') 
                        : undefined;
        const type = extractTagContent(rdfDescriptionXml, 'dc:type');
        const date = extractTagContent(rdfDescriptionXml, 'dc:date');

        searchResults.push({
          id,
          title,
          source: 'LexML Brasil',
          description,
          url: urlLink,
          type,
          date,
        });
      }
      
      return { results: searchResults };

    } catch (error) {
      console.error('Failed to fetch or parse LexML data:', error);
      return { results: [] }; // Return empty results on exception
    }
  }
);

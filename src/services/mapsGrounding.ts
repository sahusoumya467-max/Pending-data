import { GoogleGenAI } from '@google/genai';
import { MapsPlaceChunk } from '../db/schema.ts';

let cachedClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!cachedClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export interface MapsGroundingResult {
  query: string;
  markdown: string;
  places: MapsPlaceChunk[];
  fetchedAt: string;
}

export async function runMapsGroundingQuery(params: {
  query: string;
  latitude?: number;
  longitude?: number;
}): Promise<MapsGroundingResult> {
  const ai = getAiClient();
  const cleanQuery = params.query.trim();

  const hasCoords =
    typeof params.latitude === 'number' &&
    Number.isFinite(params.latitude) &&
    typeof params.longitude === 'number' &&
    Number.isFinite(params.longitude);

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: cleanQuery,
    config: {
      tools: [{ googleMaps: {} }],
      ...(hasCoords
        ? {
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: params.latitude!,
                  longitude: params.longitude!,
                },
              },
            },
          }
        : {}),
    },
  });

  const markdown = response.text || 'No geographic details returned for this query.';
  const rawChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const places: MapsPlaceChunk[] = [];
  const seenUris = new Set<string>();

  for (const chunk of rawChunks as Array<Record<string, any>>) {
    const mapsObj = chunk?.maps;
    if (!mapsObj || !mapsObj.uri) continue;
    const uri = String(mapsObj.uri);
    if (seenUris.has(uri)) continue;
    seenUris.add(uri);

    let snippet = '';
    const snippets = mapsObj?.placeAnswerSources?.reviewSnippets;
    if (Array.isArray(snippets) && snippets.length > 0) {
      const first = snippets[0];
      if (typeof first === 'string') {
        snippet = first;
      } else if (first && typeof first.content === 'string') {
        snippet = first.content;
      } else if (first && typeof first.text === 'string') {
        snippet = first.text;
      }
    }

    places.push({
      title: String(mapsObj.title || 'Google Maps Location'),
      uri,
      placeId: mapsObj.placeId ? String(mapsObj.placeId) : undefined,
      snippet: snippet || undefined,
    });
  }

  return {
    query: cleanQuery,
    markdown,
    places,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Jikan API v4 Client
 * Handles HTTP requests to Jikan API with queue-based rate limiting and error handling
 * Documentation: https://docs.api.jikan.moe/
 */

import PQueue from 'p-queue';
import type {
    JikanAnimeRaw,
    JikanCharacterRaw,
    JikanResponse,
    JikanStaffRaw,
} from './jikan-types';

// ==========================================
// CONFIGURATION
// ==========================================

const BASE_URL = process.env.JIKAN_API_BASE || 'https://api.jikan.moe/v4';
const RATE_LIMIT_MS = parseInt(process.env.JIKAN_RATE_LIMIT_MS || '1000', 10);

// ==========================================
// REQUEST QUEUE
// ==========================================

/**
 * Global request queue to serialize all Jikan API calls
 * This ensures no parallel requests and proper rate limiting
 */
const requestQueue = new PQueue({
  concurrency: 1, // Only 1 request at a time
  interval: RATE_LIMIT_MS, // Minimum time between requests
  intervalCap: 1, // Maximum 1 request per interval
});

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// ERROR HANDLING
// ==========================================

export class JikanError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
  ) {
    super(message);
    this.name = 'JikanError';
  }
}

/**
 * Checks if an error is retryable (temporary network issues, rate limits)
 */
function isRetryableError(status: number): boolean {
  return status === 429 || status >= 500;
}

// ==========================================
// CORE FETCH FUNCTION
// ==========================================

/**
 * Generic fetch function for Jikan API
 * Handles queueing, retries, and error responses
 * All requests are automatically queued to prevent parallel calls
 */
async function fetchJikan<T>(
  endpoint: string,
  options: {
    retries?: number;
    retryDelay?: number;
  } = {},
): Promise<T> {
  const { retries = 3, retryDelay = 2000 } = options;
  
  // Add request to queue - this ensures serialization
  return requestQueue.add(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = `${BASE_URL}${endpoint}`;
        console.log(`[Jikan] Requesting: ${endpoint}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
        
        const response = await fetch(url);
        
        // Handle error responses
        if (!response.ok) {
          const errorMessage = `Jikan API Error ${response.status}: ${response.statusText}`;
          
          // If retryable and we have retries left, continue to next attempt
          if (isRetryableError(response.status) && attempt < retries) {
            console.warn(`[Jikan] ${errorMessage}, retrying in ${retryDelay}ms...`);
            await sleep(retryDelay);
            continue;
          }
          
          // Otherwise throw error
          throw new JikanError(errorMessage, response.status, endpoint);
        }
        
        const json = await response.json() as JikanResponse<T>;
        return json.data;
        
      } catch (error) {
        lastError = error as Error;
        
        // If it's a JikanError and not retryable, throw immediately
        if (error instanceof JikanError && !isRetryableError(error.status || 0)) {
          throw error;
        }
        
        // If it's a network error and we have retries left, continue
        if (attempt < retries) {
          console.warn(`[Jikan] Request failed, retrying in ${retryDelay}ms...`, error);
          await sleep(retryDelay);
          continue;
        }
      }
    }
    
    // If we exhausted all retries, throw the last error
    throw lastError || new JikanError('Request failed after all retries', undefined, endpoint);
  });
}

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * Fetch complete anime metadata
 * Endpoint: GET /anime/{id}/full
 */
export async function fetchAnimeFullById(malId: number): Promise<JikanAnimeRaw> {
  return fetchJikan<JikanAnimeRaw>(`/anime/${malId}/full`);
}

/**
 * Fetch anime characters and their voice actors
 * Endpoint: GET /anime/{id}/characters
 */
export async function fetchAnimeCharacters(malId: number): Promise<JikanCharacterRaw[]> {
  return fetchJikan<JikanCharacterRaw[]>(`/anime/${malId}/characters`);
}

/**
 * Fetch anime staff members
 * Endpoint: GET /anime/{id}/staff
 */
export async function fetchAnimeStaff(malId: number): Promise<JikanStaffRaw[]> {
  return fetchJikan<JikanStaffRaw[]>(`/anime/${malId}/staff`);
}

/**
 * Fetch all data for an anime in one go
 * This will make 3 separate API calls with rate limiting
 */
export async function fetchCompleteAnimeData(malId: number): Promise<{
  anime: JikanAnimeRaw;
  characters: JikanCharacterRaw[];
  staff: JikanStaffRaw[];
}> {
  const anime = await fetchAnimeFullById(malId);
  const characters = await fetchAnimeCharacters(malId);
  const staff = await fetchAnimeStaff(malId);
  
  return { anime, characters, staff };
}

/**
 * Get current queue status
 */
export function getQueueStatus(): {
  pending: number;
  size: number;
} {
  return {
    pending: requestQueue.pending,
    size: requestQueue.size,
  };
}

/**
 * Clear the queue (useful for testing)
 */
export function clearQueue(): void {
  requestQueue.clear();
}

/**
 * Wait for all queued requests to complete
 */
export async function waitForQueue(): Promise<void> {
  await requestQueue.onIdle();
}

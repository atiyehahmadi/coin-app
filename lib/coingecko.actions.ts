'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

// Server-side helper to determine if a pro API key is available.
const PRO_API_KEY = process.env.COINGECKO_API_KEY ?? null;

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
  opts?: { retries?: number },
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const maxRetries = opts?.retries ?? 3;

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // If a server-side CoinGecko API key is present, send it as the pro header.
    // Do NOT expose this key in client bundles or logs.
    if (PRO_API_KEY) {
      headers['x-cg-pro-api-key'] = PRO_API_KEY;
    }

    const response = await fetch(url, {
      headers,
      next: { revalidate },
    });

    if (response.ok) {
      return response.json();
    }

    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

    // Diagnostic logging for non-200 responses to help surface issues in production.
    // This logs the request URL and status + response body but never prints secrets.
    try {
      // eslint-disable-next-line no-console
      console.error(`[CoinGecko] Request failed`, {
        url,
        status: response.status,
        body: errorBody,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (logErr) {
      // swallow logging errors to avoid masking the real error
    }

    // Handle rate limiting with Retry-After header and exponential backoff + jitter
    if (response.status === 429 && attempt < maxRetries) {
      const retryAfter = response.headers.get?.('retry-after');
      let waitMs = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s, ...

      if (retryAfter) {
        const ra = Number(retryAfter);
        if (!Number.isNaN(ra)) {
          waitMs = ra * 1000;
        } else {
          const date = Date.parse(retryAfter);
          if (!Number.isNaN(date)) {
            waitMs = Math.max(0, date - Date.now());
          }
        }
      }

      // jitter
      waitMs += Math.floor(Math.random() * 300);

      await sleep(waitMs);
      continue;
    }

    // For other errors (or exhausted retries) throw a descriptive error
    throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText} `);
  }

  throw new Error('API Error: Too many retries due to rate limiting');
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

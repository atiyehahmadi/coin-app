'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

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
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate },
    });

    if (response.ok) {
      return response.json();
    }

    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

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

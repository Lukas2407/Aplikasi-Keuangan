/**
 * Pemanggil HTTP untuk sumber data terbuka.
 *
 * Overpass, Nominatim, dan Open Prices semuanya layanan sukarela. Aturan
 * pemakaiannya serupa: sebutkan identitas aplikasi di User-Agent, jangan
 * kirim permintaan bertubi-tubi, dan hormati jawaban 429. Semua itu
 * dikumpulkan di satu tempat supaya tidak ada pemanggil yang lupa.
 *
 * Batas di sini bersifat per-proses. Di serverless, tiap instance punya
 * memori sendiri, jadi antrean ini tidak cukup sebagai satu-satunya rem.
 * Rem yang sebenarnya ada di lapis basis data: tabel ImportRun membuat
 * permintaan atas area yang sama dilewati, bukan diulang.
 */

const DEFAULT_UA =
  process.env.SOURCE_USER_AGENT ??
  'DapurKita/0.1 (meal planner; https://github.com/Lukas2407/Aplikasi-Keuangan)';

/** Jeda minimum antar permintaan ke satu host, dalam milidetik. */
const MIN_INTERVAL_MS: Record<string, number> = {
  'nominatim.openstreetmap.org': 1100, // aturan resminya: maksimal 1 per detik
  'overpass-api.de': 1000,
  'prices.openfoodfacts.org': 500,
};

const lastCall = new Map<string, number>();
const queues = new Map<string, Promise<unknown>>();

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Jalankan tugas per host secara berurutan, dengan jeda minimum. */
function serialize<T>(host: string, task: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const gap = MIN_INTERVAL_MS[host] ?? 250;
    const since = Date.now() - (lastCall.get(host) ?? 0);
    if (since < gap) await delay(gap - since);
    try {
      return await task();
    } finally {
      lastCall.set(host, Date.now());
    }
  };

  const chained = (queues.get(host) ?? Promise.resolve()).then(run, run);
  // Rantai antrean tidak boleh putus gara-gara satu permintaan gagal.
  queues.set(
    host,
    chained.catch(() => undefined),
  );
  return chained;
}

export class SourceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'SourceError';
  }
}

export type FetchOptions = {
  method?: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
};

/**
 * Ambil JSON dengan batas waktu, antre per host, dan ulang otomatis pada
 * 429 atau 5xx. Header Retry-After dipatuhi kalau ada.
 */
export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, timeoutMs = 30_000, retries = 2 } = options;
  const host = new URL(url).host;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await serialize(host, async () => {
        const res = await fetch(url, {
          method,
          body,
          headers: {
            'User-Agent': DEFAULT_UA,
            Accept: 'application/json',
            ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
            ...headers,
          },
          signal: AbortSignal.timeout(timeoutMs),
          // Data ini disimpan sendiri ke basis data, jadi cache HTTP tidak perlu.
          cache: 'no-store',
        });

        if (res.status === 429 || res.status >= 500) {
          const retryAfter = Number(res.headers.get('retry-after'));
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            await delay(Math.min(retryAfter, 30) * 1000);
          }
          throw new SourceError(`${host} menjawab ${res.status}`, res.status, true);
        }
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new SourceError(
            `${host} menjawab ${res.status}: ${text.slice(0, 200)}`,
            res.status,
            false,
          );
        }
        return (await res.json()) as T;
      });
    } catch (err) {
      lastError = err;
      const retryable =
        err instanceof SourceError ? err.retryable : err instanceof Error && err.name === 'TimeoutError';
      if (!retryable || attempt === retries) break;
      await delay(1000 * 2 ** attempt); // 1 detik, lalu 2 detik
    }
  }
  throw lastError instanceof Error ? lastError : new SourceError('Permintaan gagal');
}

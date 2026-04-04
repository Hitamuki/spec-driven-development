type IdempotencyResult = {
  status: number;
  body: unknown;
};

type PendingEntry = {
  kind: 'pending';
  payload: string;
  promise: Promise<IdempotencyResult>;
  createdAt: number;
};

type CompletedEntry = {
  kind: 'completed';
  payload: string;
  result: IdempotencyResult;
  createdAt: number;
};

type Entry = PendingEntry | CompletedEntry;

const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

class IdempotencyStore {
  private entries = new Map<string, Entry>();

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries.entries()) {
      if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
        this.entries.delete(key);
      }
    }
  }

  async execute(
    key: string,
    payload: string,
    handler: () => Promise<IdempotencyResult>,
  ): Promise<IdempotencyResult | { conflict: true }> {
    this.cleanupExpired();

    const existing = this.entries.get(key);
    if (existing) {
      if (existing.payload !== payload) {
        return { conflict: true };
      }

      if (existing.kind === 'completed') {
        return existing.result;
      }

      return await existing.promise;
    }

    const promise = handler();
    this.entries.set(key, {
      kind: 'pending',
      payload,
      promise,
      createdAt: Date.now(),
    });

    try {
      const result = await promise;
      this.entries.set(key, {
        kind: 'completed',
        payload,
        result,
        createdAt: Date.now(),
      });
      return result;
    } catch (error) {
      this.entries.delete(key);
      throw error;
    }
  }

  clear(): void {
    this.entries.clear();
  }
}

export const idempotencyStore = new IdempotencyStore();

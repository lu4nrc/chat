import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export function get<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function set(key: string, value: any, ttl?: number): boolean {
  if (ttl) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
}

export function del(key: string): number {
  return cache.del(key);
}

export function flush(): void {
  cache.flushAll();
}

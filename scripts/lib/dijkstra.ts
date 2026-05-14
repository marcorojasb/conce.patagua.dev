// Tiny Dijkstra implementation tailored to the rail-graph use case
// (≤ ~10 k nodes, undirected, positive weights). A binary min-heap keyed
// on tentative distance is fast enough; the corridor filter trims the
// search space before this runs.

class MinHeap {
  private heap: Array<[number, number]> = [];

  size(): number {
    return this.heap.length;
  }

  push(item: [number, number]): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): [number, number] | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    const heap = this.heap;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (heap[idx][0] < heap[parent][0]) {
        [heap[idx], heap[parent]] = [heap[parent], heap[idx]];
        idx = parent;
      } else break;
    }
  }

  private bubbleDown(idx: number): void {
    const heap = this.heap;
    const len = heap.length;
    while (true) {
      const l = idx * 2 + 1;
      const r = idx * 2 + 2;
      let smallest = idx;
      if (l < len && heap[l][0] < heap[smallest][0]) smallest = l;
      if (r < len && heap[r][0] < heap[smallest][0]) smallest = r;
      if (smallest === idx) break;
      [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
      idx = smallest;
    }
  }
}

export interface AdjEntry {
  to: number;
  w: number;
}

/**
 * Returns the shortest-path node-id sequence from `start` to `end`, restricted
 * to nodes present in `allowed`. Returns an empty array if `end` is
 * unreachable within the allowed set.
 */
export function dijkstra(
  adj: Map<number, AdjEntry[]>,
  start: number,
  end: number,
  allowed: Set<number>,
): number[] {
  if (!allowed.has(start) || !allowed.has(end)) return [];
  const dist = new Map<number, number>();
  const prev = new Map<number, number>();
  dist.set(start, 0);
  const heap = new MinHeap();
  heap.push([0, start]);

  while (heap.size() > 0) {
    const [d, u] = heap.pop()!;
    if (u === end) break;
    if (d > (dist.get(u) ?? Infinity)) continue;
    const neighbors = adj.get(u);
    if (!neighbors) continue;
    for (const { to, w } of neighbors) {
      if (!allowed.has(to)) continue;
      const alt = d + w;
      if (alt < (dist.get(to) ?? Infinity)) {
        dist.set(to, alt);
        prev.set(to, u);
        heap.push([alt, to]);
      }
    }
  }

  if (!prev.has(end) && start !== end) return [];
  const path: number[] = [];
  let cur: number | undefined = end;
  while (cur !== undefined) {
    path.unshift(cur);
    cur = prev.get(cur);
    if (cur === start) {
      path.unshift(start);
      break;
    }
  }
  return path[0] === start ? path : [];
}

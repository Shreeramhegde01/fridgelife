// heap.js — MinHeap sorted by expiry_date (soonest first)
// Written completely from scratch — no external libraries.

class MinHeap {
  constructor() {
    this.heap = []; // array of { id, name, expiry_date, days_remaining }
  }

  // ─── helpers ────────────────────────────────────────
  _parent(i) {
    return Math.floor((i - 1) / 2);
  }
  _left(i) {
    return 2 * i + 1;
  }
  _right(i) {
    return 2 * i + 2;
  }
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Compare by expiry_date ascending (earlier date = smaller)
  _compare(a, b) {
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  }

  // ─── core operations ───────────────────────────────

  /**
   * Bubble the element at index i upward until heap property is restored.
   * Time: O(log n)
   */
  heapifyUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this._compare(this.heap[i], this.heap[p]) < 0) {
        this._swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  /**
   * Push the element at index i downward until heap property is restored.
   * Time: O(log n)
   */
  heapifyDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = this._left(i);
      const r = this._right(i);

      if (l < n && this._compare(this.heap[l], this.heap[smallest]) < 0) {
        smallest = l;
      }
      if (r < n && this._compare(this.heap[r], this.heap[smallest]) < 0) {
        smallest = r;
      }
      if (smallest !== i) {
        this._swap(i, smallest);
        i = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Insert a new item into the heap.
   * Time: O(log n)
   */
  insert(item) {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Remove and return the minimum element (soonest expiry).
   * Time: O(log n)
   */
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  /**
   * Peek at the minimum element without removing it.
   * Time: O(1)
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Build a heap from an unsorted array using Floyd's algorithm.
   * Time: O(n)
   */
  buildHeap(array) {
    this.heap = array.map((item) => ({
      id: item.id,
      name: item.name,
      expiry_date: item.expiry_date,
      days_remaining: this._daysRemaining(item.expiry_date),
    }));

    // Start from last non-leaf and heapify down
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  /**
   * Remove a specific item by id.
   * Time: O(n) — linear scan + O(log n) heapify
   */
  removeById(id) {
    const idx = this.heap.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const removed = this.heap[idx];

    if (idx === this.heap.length - 1) {
      this.heap.pop();
    } else {
      this.heap[idx] = this.heap.pop();
      this.heapifyDown(idx);
      this.heapifyUp(idx);
    }

    return removed;
  }

  /**
   * Get all items expiring within `days` days.
   * Scans the entire heap — O(n).
   */
  getExpiringWithin(days) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.heap
      .filter((item) => {
        const diff = this._daysRemaining(item.expiry_date);
        return diff <= days;
      })
      .sort((a, b) => this._compare(a, b));
  }

  /**
   * Return the full heap array (for visualizer / debug).
   */
  toArray() {
    // Refresh days_remaining on read
    return this.heap.map((item) => ({
      ...item,
      days_remaining: this._daysRemaining(item.expiry_date),
    }));
  }

  get size() {
    return this.heap.length;
  }

  // ─── utility ────────────────────────────────────────
  _daysRemaining(expiryDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  }
}

module.exports = MinHeap;

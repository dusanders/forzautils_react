
/**
 * Utility array for keeping the length
 * a constant value by shifting off the
 * first element once a max is reached.
 */
export class LimitedArray<T> {
  private maxIndex: number;
  /**
   * Accessible data array
   */
  readonly data: T[];
  constructor(maxIndex: number, init?: T[]) {
    this.maxIndex = maxIndex;
    this.data = init || [];
  }
  /**
   * Push element into data.
   * NOTE: this method returns a new instance
   * of the LimitedArray class to activate
   * the React state notifier!
   * @param element Element to push
   * @returns New instance of this
   */
  push(element: T): LimitedArray<T> {
    if(this.data.length >= this.maxIndex) {
      this.data.shift();
    }
    const result = new LimitedArray<T>(
      this.maxIndex,
      [...this.data, element]
    );
    return result;
  }
}
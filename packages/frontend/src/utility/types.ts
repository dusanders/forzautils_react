
export type StateHandler<T> = (prev: T, next: Partial<T>) => T;
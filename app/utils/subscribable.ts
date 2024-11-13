import { nanoid } from 'nanoid'

/**
 * Interface defining a subscribable object that manages callback functions
 * @template T - The callback function type, defaults to () => void
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface Subscribable<T extends Function = () => void> {
  addCallback: (callback: T, id?: string) => string
  removeCallback: (id: string | T) => void
  getCallbacks: () => T[]
  getCallback: (id: string) => T
  getCallbackIds: () => string[]
  clearCallbacks: () => void
  runCallbacks: T
}

/**
 * Creates a subscribable instance that manages a collection of callbacks
 * @template T - The callback function type, defaults to () => void
 * @returns A Subscribable instance with methods to manage callbacks
 */
export const subscribable = <
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function = () => void,
>(): Subscribable<T> => {
  // Store callbacks in a record with string keys
  const callbacks: Record<string, T> = {}

  /**
   * Adds a new callback function to the collection
   * @param callback - The function to add
   * @param id - Optional custom ID for the callback
   * @returns The ID assigned to the callback
   */
  const addCallback = (callback: T, id: string): string => {
    const _id = id || nanoid(4)
    callbacks[_id] = callback
    return _id
  }

  /**
   * Removes a callback either by its ID or by the function reference
   * @param id - Either the callback's ID or the callback function itself
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  const removeCallback = (id: string | Function): void => {
    if (typeof id === 'function') {
      const key = Object.keys(callbacks).find((k) => callbacks[k] === id)
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      if (key) delete callbacks[key]
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete callbacks[id]
  }

  /**
   * Returns an array of all registered callbacks
   */
  const getCallbacks = (): T[] => Object.values(callbacks)

  /**
   * Retrieves a specific callback by its ID
   * @param id - The ID of the callback to retrieve
   */
  const getCallback = (id: string): T => callbacks[id]

  /**
   * Removes all registered callbacks
   */
  const clearCallbacks = (): void => {
    Object.keys(callbacks).forEach((id) => {
      removeCallback(id)
    })
  }

  /**
   * Executes all registered callbacks with the provided parameters
   * Returns the result of the last executed callback
   * @param params - Parameters to pass to each callback
   */
  const runCallbacks = (...params: unknown[]): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    let response = undefined as any
    Object.values(callbacks).forEach((callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      response = callback(...params)
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response
  }

  // Return the public interface
  return {
    addCallback,
    removeCallback,
    getCallback,
    getCallbacks,
    getCallbackIds: () => Object.keys(callbacks),
    clearCallbacks,
    runCallbacks: runCallbacks as unknown as T,
  } as Subscribable<T>
}

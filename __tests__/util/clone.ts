export function clone<T>(object: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(object)), object)
}

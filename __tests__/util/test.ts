/// <reference types="jest" />

export async function asyncTest<T>(
  done: jest.DoneCallback,
  callback: () => Promise<T>
): Promise<void> {
  try {
    await callback()

    done()
  } catch (e) {
    // tslint:disable:no-console
    console.error(e.stack)
    // tslint:enable

    done.fail(e)
  }
}

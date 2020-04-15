export async function run(name: string, callback: () => void): Promise<void> {
  // tslint:disable-next-line:no-console
  console.log(`Running script "${name}"`)

  try {
    await callback()
  } catch (e) {
    // tslint:disable:no-console
    console.error(`Error running script "${name}"!`)
    console.error(e)
    // tslint:enable
  }

  // tslint:disable-next-line:no-console
  console.log('Done!')

  process.exit()
}

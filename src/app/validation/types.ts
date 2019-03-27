import { CustomError } from 'ts-custom-error'

export class ValidationError extends CustomError {
  public constructor(
    public readonly type: string,
    public readonly value: any,
    public readonly message: string = `Validation error for type "${type}", value: ${JSON.stringify(
      value
    )} (${typeof value})`
  ) {
    super(message)
  }
}

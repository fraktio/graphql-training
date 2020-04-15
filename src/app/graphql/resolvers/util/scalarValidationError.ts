export enum ScalarValidationErrorType {
  SCALAR_VALIDATION_ERROR = 'SCALAR_VALIDATION_ERROR'
}

export interface ScalarValidationError {
  type: ScalarValidationErrorType.SCALAR_VALIDATION_ERROR
  message: string
}

function searchTree(element, matchingTitle) {
  const isObject = typeof element === 'object' && element != null
  if (
    isObject &&
    'type' in element &&
    element.type === ScalarValidationErrorType.SCALAR_VALIDATION_ERROR
  ) {
    return true
  }

  if (element.children != null) {
    var i
    var result = null
    for (i = 0; result == null && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle)
    }
    return result
  }
  return false
}

export function hasScalarValidationErrors(value: any): boolean {
  return searchTree(value, ScalarValidationErrorType.SCALAR_VALIDATION_ERROR) !== false
}

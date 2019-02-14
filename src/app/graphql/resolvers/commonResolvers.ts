export interface Node {
  __typename: string
}

export const commonResolvers = {
  Node: {
    __resolveType(node: Node): string {
      return node.__typename
    }
  }
}

import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type ResolveSuggestionsMutationVariables = Types.Exact<{
  input: Types.ResolveSuggestionsInput
}>

export type ResolveSuggestionsMutation = {
  resolveSuggestions: Pick<Types.ResolveSuggestionsResponse, 'success'> & {
    processed: Array<
      Pick<
        Types.ResolvedSuggestion,
        | 'suggestionId'
        | 'action'
        | 'employeeName'
        | 'skillName'
        | 'proficiencyLevel'
      >
    >
    errors: Array<
      Pick<Types.ResolutionError, 'suggestionId' | 'message' | 'code'>
    >
  }
}

export const ResolveSuggestionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResolveSuggestions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ResolveSuggestionsInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resolveSuggestions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'processed' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'suggestionId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'action' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'employeeName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'skillName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'proficiencyLevel' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'errors' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'suggestionId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'message' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResolveSuggestionsMutation,
  ResolveSuggestionsMutationVariables
>

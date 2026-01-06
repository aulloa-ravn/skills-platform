import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type GetSeniorityHistoryQueryVariables = Types.Exact<{
  profileId: Types.Scalars['String']['input']
}>

export type GetSeniorityHistoryQuery = {
  getSeniorityHistory: Array<
    Pick<
      Types.SeniorityHistoryRecord,
      | 'id'
      | 'profileId'
      | 'seniorityLevel'
      | 'startDate'
      | 'endDate'
      | 'createdAt'
      | 'updatedAt'
    >
  >
}

export const GetSeniorityHistoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSeniorityHistory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'profileId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getSeniorityHistory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'profileId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'profileId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'profileId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'seniorityLevel' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSeniorityHistoryQuery,
  GetSeniorityHistoryQueryVariables
>

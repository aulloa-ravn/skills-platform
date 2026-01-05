import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type CreateSeniorityHistoryMutationVariables = Types.Exact<{
  input: Types.CreateSeniorityHistoryInput
}>

export type CreateSeniorityHistoryMutation = {
  createSeniorityHistory: Pick<
    Types.SeniorityHistoryRecord,
    | 'id'
    | 'profileId'
    | 'seniorityLevel'
    | 'startDate'
    | 'endDate'
    | 'createdAt'
    | 'updatedAt'
  >
}

export const CreateSeniorityHistoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSeniorityHistory' },
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
              name: { kind: 'Name', value: 'CreateSeniorityHistoryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSeniorityHistory' },
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
  CreateSeniorityHistoryMutation,
  CreateSeniorityHistoryMutationVariables
>

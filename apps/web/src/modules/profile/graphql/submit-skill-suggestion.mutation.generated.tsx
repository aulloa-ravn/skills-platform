import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type SubmitSkillSuggestionMutationVariables = Types.Exact<{
  input: Types.SubmitSkillSuggestionInput
}>

export type SubmitSkillSuggestionMutation = {
  submitSkillSuggestion: Pick<
    Types.SubmittedSuggestionResponse,
    'suggestionId' | 'status' | 'suggestedProficiency' | 'createdAt'
  > & {
    skill: Pick<Types.SubmittedSuggestionSkill, 'id' | 'name' | 'discipline'>
  }
}

export const SubmitSkillSuggestionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SubmitSkillSuggestion' },
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
              name: { kind: 'Name', value: 'SubmitSkillSuggestionInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'submitSkillSuggestion' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'suggestionId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'suggestedProficiency' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'skill' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'discipline' },
                      },
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
  SubmitSkillSuggestionMutation,
  SubmitSkillSuggestionMutationVariables
>

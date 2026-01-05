import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type UpdateSkillMutationVariables = Types.Exact<{
  input: Types.UpdateSkillInput
}>

export type UpdateSkillMutation = {
  updateSkill: Pick<
    Types.Skill,
    'id' | 'name' | 'discipline' | 'isActive' | 'employeeCount' | 'createdAt'
  >
}

export const UpdateSkillDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSkill' },
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
              name: { kind: 'Name', value: 'UpdateSkillInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSkill' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'discipline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'employeeCount' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSkillMutation, UpdateSkillMutationVariables>

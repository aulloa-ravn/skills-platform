import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type GetAllSkillsQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.GetAllSkillsInput>
}>

export type GetAllSkillsQuery = {
  getAllSkills: Array<
    Pick<
      Types.Skill,
      'id' | 'name' | 'discipline' | 'isActive' | 'employeeCount' | 'createdAt'
    >
  >
}

export const GetAllSkillsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllSkills' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'GetAllSkillsInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getAllSkills' },
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
} as unknown as DocumentNode<GetAllSkillsQuery, GetAllSkillsQueryVariables>

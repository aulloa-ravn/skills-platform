import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type GetAllProfilesForAdminQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.GetAllProfilesForAdminInput>
}>

export type GetAllProfilesForAdminQuery = {
  getAllProfilesForAdmin: Pick<
    Types.PaginatedProfilesResponse,
    'totalCount' | 'currentPage' | 'pageSize' | 'totalPages'
  > & {
    profiles: Array<
      Pick<
        Types.ProfileListItemResponse,
        | 'id'
        | 'name'
        | 'email'
        | 'avatarUrl'
        | 'currentSeniorityLevel'
        | 'joinDate'
        | 'currentAssignmentsCount'
        | 'coreStackSkills'
        | 'remainingSkillsCount'
      >
    >
  }
}

export const GetAllProfilesForAdminDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllProfilesForAdmin' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'GetAllProfilesForAdminInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getAllProfilesForAdmin' },
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
                  name: { kind: 'Name', value: 'profiles' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'avatarUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'currentSeniorityLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'joinDate' },
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'currentAssignmentsCount',
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreStackSkills' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'remainingSkillsCount' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'currentPage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pageSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalPages' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllProfilesForAdminQuery,
  GetAllProfilesForAdminQueryVariables
>

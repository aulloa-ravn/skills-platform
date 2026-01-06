import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type GetProfileQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input']
}>

export type GetProfileQuery = {
  getProfile: Pick<
    Types.ProfileResponse,
    'id' | 'name' | 'email' | 'avatarUrl' | 'currentSeniorityLevel'
  > & {
    skills: {
      coreStack: Array<
        Pick<
          Types.ValidatedSkillResponse,
          'skillName' | 'discipline' | 'proficiencyLevel' | 'validatedAt'
        > & {
          validator?: Types.Maybe<Pick<Types.ValidatorInfo, 'id' | 'name'>>
        }
      >
      validatedInventory: Array<
        Pick<
          Types.ValidatedSkillResponse,
          'skillName' | 'discipline' | 'proficiencyLevel' | 'validatedAt'
        > & {
          validator?: Types.Maybe<Pick<Types.ValidatorInfo, 'id' | 'name'>>
        }
      >
      pending: Array<
        Pick<
          Types.PendingSkillResponse,
          'skillName' | 'discipline' | 'suggestedProficiency' | 'createdAt'
        >
      >
    }
    seniorityHistory: Array<
      Pick<
        Types.SeniorityHistoryResponse,
        'seniorityLevel' | 'startDate' | 'endDate'
      >
    >
    currentAssignments: Array<
      Pick<Types.CurrentAssignmentResponse, 'projectName' | 'role' | 'tags'> & {
        techLead?: Types.Maybe<
          Pick<Types.TechLeadInfo, 'id' | 'name' | 'email' | 'avatarUrl'>
        >
      }
    >
  }
}

export const GetProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'getProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'currentSeniorityLevel' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'skills' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreStack' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'skillName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'discipline' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'proficiencyLevel' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'validatedAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'validator' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'validatedInventory' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'skillName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'discipline' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'proficiencyLevel' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'validatedAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'validator' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pending' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'skillName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'discipline' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'suggestedProficiency',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'seniorityHistory' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'seniorityLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'startDate' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'endDate' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'currentAssignments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'projectName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'techLead' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'avatarUrl' },
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
      },
    },
  ],
} as unknown as DocumentNode<GetProfileQuery, GetProfileQueryVariables>

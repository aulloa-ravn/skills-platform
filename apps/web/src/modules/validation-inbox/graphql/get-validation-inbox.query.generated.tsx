import type * as Types from '../../../shared/lib/types'

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type GetValidationInboxQueryVariables = Types.Exact<{
  [key: string]: never
}>

export type GetValidationInboxQuery = {
  getValidationInbox: {
    projects: Array<
      Pick<
        Types.ProjectInbox,
        'projectId' | 'projectName' | 'pendingSuggestionsCount'
      > & {
        employees: Array<
          Pick<
            Types.EmployeeInbox,
            | 'employeeId'
            | 'employeeName'
            | 'employeeEmail'
            | 'employeeCurrentSeniorityLevel'
            | 'employeeAvatarUrl'
            | 'pendingSuggestionsCount'
          > & {
            suggestions: Array<
              Pick<
                Types.PendingSuggestion,
                | 'id'
                | 'skillName'
                | 'discipline'
                | 'suggestedProficiency'
                | 'source'
                | 'createdAt'
                | 'currentProficiency'
              >
            >
          }
        >
      }
    >
  }
}

export const GetValidationInboxDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetValidationInbox' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getValidationInbox' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'projects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'projectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'projectName' },
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'pendingSuggestionsCount',
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'employees' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'employeeId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'employeeName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'employeeEmail' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'employeeCurrentSeniorityLevel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'employeeAvatarUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'pendingSuggestionsCount',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'suggestions' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
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
                                    name: { kind: 'Name', value: 'source' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'currentProficiency',
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
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetValidationInboxQuery,
  GetValidationInboxQueryVariables
>

import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: '../api/src/schema.gql',
  documents: 'src/**/*.graphql',
  ignoreNoDocuments: true,
  generates: {
    './src/shared/lib/types.ts': {
      plugins: [
        {
          add: {
            content: '/* eslint-disable @typescript-eslint/no-explicit-any */',
          },
        },
        'typescript',
      ],
      config: {
        namingConvention: {
          enumValues: 'keep',
        },
      },
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.tsx',
        baseTypesPath: './shared/lib/types.ts',
      },
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        useTypeImports: true,
        skipTypename: true,
        preResolveTypes: false,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
}

export default config

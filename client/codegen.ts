import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    // schema: 'https://api.cartridge.gg/x/risingrevenant/torii/graphql',
    schema: "http://127.0.0.1:8080/graphql",
    documents: 'src/**/*.graphql',
    generates: {
        'src/generated/graphql.ts': {
            plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
            config: {
                rawRequest: true
            },
        },
    },
};
export default config;
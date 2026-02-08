module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Strip .js extensions from ESM-style imports so ts-jest resolves .ts files
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Make sure Jest can see the files even if excluded in tsconfig
    // ts-jest creates a tailored config by default, but we might need to be explicit if issues persist
};

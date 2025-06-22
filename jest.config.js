/**
 * Jest 設定ファイル（TypeScript対応）
 * ts-jestでTypeScriptをトランスパイルし、src配下の.ts/.tsxテストを実行可能にする
 */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/?(*.)+(spec|test).(ts|tsx|js)'
    ],
    moduleNameMapper: {
        // CSS/SCSS等のimportを無視
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
};

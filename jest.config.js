/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle CSS imports (if you import CSS in your components)
    '\\.(css|less|scss|sass)$' : 'identity-obj-proxy',
    // Handle static asset imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$' : '<rootDir>/__mocks__/fileMock.js',
    // Alias to match tsconfig paths if any (e.g., @/components/*)
    // '@/(.*)': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Optional setup file
  transform: {
    // Process ts/tsx files with ts-jest
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
}; 
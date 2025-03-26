import spawn from 'nano-spawn'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'preset.ts',
  ],
  outDir: '.',
  clean: false,
  stub: false,
  declaration: 'node16',
  failOnWarn: false,
  alias: {
    '@likec4/style-preset/src': '@likec4/style-preset',
  },
  rollup: {
    inlineDependencies: true,
    resolve: {
      exportConditions: ['sources'],
    },
  },
  hooks: {
    async 'build:before'(ctx) {
      await spawn('pnpm', ['generate'])
    },
  },
})

import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  stub: false,
  declaration: 'node16',
  rollup: {
    emitCJS: false,
    inlineDependencies: true,
  },
})

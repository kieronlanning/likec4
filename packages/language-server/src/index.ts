import { configureLogger, getAnsiColorFormatter, getConsoleSink, getTextFormatter } from '@likec4/log'
import { startLanguageServer as startLanguim } from 'langium/lsp'
import { hasTTY } from 'std-env'
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node'
import { LikeC4FileSystem } from './LikeC4FileSystem'
import { getLspConnectionSink, logger } from './logger'
import { type LikeC4Services, type LikeC4SharedServices, createCustomLanguageServices } from './module'
import { ConfigurableLayouter } from './views/configurable-layouter'

export { getLspConnectionSink, logger as lspLogger } from './logger'

export type { DocumentParser, LikeC4ModelBuilder, LikeC4ModelLocator, LikeC4ModelParser } from './model'

export { createCustomLanguageServices, createLanguageServices, LikeC4Module } from './module'
export type { LikeC4Services, LikeC4SharedServices } from './module'
export type { LikeC4Views } from './views'
export { LikeC4FileSystem }

export async function startLanguageServer(): Promise<{
  shared: LikeC4SharedServices
  likec4: LikeC4Services
}> {
  const connection = createConnection(ProposedFeatures.all)
  // @ts-ignore
  const isDebug = process.env.NODE_ENV === 'development'

  await configureLogger({
    sinks: {
      console: getConsoleSink({
        formatter: getTextFormatter(),
      }),
      lsp: getLspConnectionSink(connection),
    },
    // filters: {
    //   errors: 'error'
    // },
    loggers: [
      {
        category: ['likec4'],
        sinks: ['console', 'lsp'],
      },
    ],
  })
  logger.info('Starting LikeC4 language server')
  // Inject the shared services and language-specific services
  const services = createCustomLanguageServices({ connection, ...LikeC4FileSystem }, ConfigurableLayouter)

  // Start the language server with the shared services
  startLanguim(services.shared)

  return services
}

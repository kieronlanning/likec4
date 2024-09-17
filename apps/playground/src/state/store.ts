import { type ComputedLikeC4Model, type ComputedView, type DiagramView, invariant, type ViewID } from '@likec4/core'
import { changeView, fetchComputedModel, locate, type LocateParams } from '@likec4/language-server/protocol'
import { DEV } from 'esm-env'
import type { MonacoLanguageClient } from 'monaco-languageclient'
import type { Simplify } from 'type-fest'
import type { Location } from 'vscode-languageserver-protocol'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import type { LikeC4DiagramProps } from '@likec4/diagram'
import { graphvizLayouter } from '@likec4/layouts'
import { deepEqual } from 'fast-equals'
import { nanoid } from 'nanoid'
import pLimit from 'p-limit'
import { forEachObj, isError, mapValues, mergeDeep } from 'remeda'
import { LikeC4WorkspacesKey, type LocalStorageWorkspace } from './use-workspaces'

export type WorkspaceStore = {
  readonly uniqueId: string
  /**
   * The name of the workspace.
   * Used as path-prefix.
   */
  name: string

  title: string

  languageClient: {
    (): MonacoLanguageClient | null
  }

  initialized: boolean

  /**
   * The current file (key in files map).
   */
  currentFilename: string

  /**
   * The files in the workspace.
   */
  files: {
    [filename: string]: string
  }

  originalFiles: {
    [filename: string]: string
  }

  likeC4Model: ComputedLikeC4Model | null
  modelFetched: boolean

  /**
   * Current diagram.
   */
  viewId: ViewID
  computedView: ComputedView | null
  diagram: DiagramView | null
  diagramAsDot: string | null

  diagrams: Record<
    ViewID,
    {
      // Never loaded
      state: 'pending'
      view: null
      error: null
    } | {
      state: 'success'
      view: DiagramView
      error: null
    } | {
      state: 'error'
      view: DiagramView | null
      error: string
    } | {
      state: 'stale'
      view: DiagramView | null
      error: string | null
    }
  >

  requestedLocation: Location | null
}

interface WorkspaceStoreActions {
  isModified: () => boolean
  updateCurrentFile: (content: string) => void

  currentFileContent: () => string

  onDidChangeModel: () => void

  openView: (viewId: string) => void

  layoutView: () => void

  onChanges: NonNullable<LikeC4DiagramProps['onChange']>

  showLocation: (location: LocateParams) => Promise<void>
}

export type WorkspaceState = Simplify<WorkspaceStore & WorkspaceStoreActions>

export type CreateWorkspaceStore = Pick<WorkspaceStore, 'name' | 'title' | 'currentFilename' | 'files'> & {
  skipHydration?: boolean
  /**
   * monaco-editor configuration.
   */
  // userConfig: UserConfig
}

const noReplace = false

let storeDevId = 1

const containsWithId = <T extends { id: string }>(arr: T[], id: string) => arr.some((x) => x.id === id)

type PersistedState = Pick<WorkspaceState, 'name' | 'title' | 'currentFilename' | 'files' | 'originalFiles'>

export type CreatedWorkspaceStore = ReturnType<typeof createWorkspaceStore>

export function createWorkspaceStore<T extends CreateWorkspaceStore>({
  name,
  title,
  currentFilename,
  files,
  skipHydration
  // userConfig
}: T) {
  let seq = 1
  const uniqueId = nanoid(6)

  const layoutLimit = pLimit(1)
  const fetchModelLimit = pLimit(1)

  return createWithEqualityFn<
    WorkspaceState,
    [
      ['zustand/persist', PersistedState],
      ['zustand/subscribeWithSelector', never],
      ['zustand/devtools', never]
    ]
  >(
    persist(
      subscribeWithSelector(
        devtools<WorkspaceState>(
          (set, get) => ({
            uniqueId,
            name: name,
            title: title,
            languageClient: () => null,
            initialized: false,

            currentFilename,
            files: structuredClone(files),
            originalFiles: structuredClone(files),

            likeC4Model: null,
            modelFetched: false,

            viewId: 'index' as ViewID,
            computedView: null,
            diagram: null,
            diagrams: {},
            diagramAsDot: null,
            requestedLocation: null,

            isModified: () => {
              const { files, originalFiles } = get()
              return !shallow(files, originalFiles)
            },

            updateCurrentFile: (content) => {
              const { currentFilename, files } = get()
              if (content === files[currentFilename]) {
                return
              }
              set(
                {
                  files: { ...files, [currentFilename]: content }
                },
                noReplace,
                'updateCurrentFile'
              )
            },

            currentFileContent: () => {
              const { currentFilename, files } = get()
              return files[currentFilename] ?? ''
            },

            onDidChangeModel: () => {
              const label = `onDidChangeModel (${seq++})`
              const { languageClient } = get()
              const client = languageClient()
              invariant(client, 'Language client is not initialized')
              if (fetchModelLimit.pendingCount > 0) {
                console.warn('clearing fetchModelLimit queue')
                fetchModelLimit.clearQueue()
              }
              fetchModelLimit(async () => {
                if (DEV) {
                  console.time(label)
                  console.log(`start ${label}`)
                }
                try {
                  const { model } = await client.sendRequest(fetchComputedModel)
                  if (model) {
                    const {
                      likeC4Model: currentmodel,
                      diagrams: currentDiagrams
                    } = get()
                    // Copy diagram states
                    const diagrams = mapValues(
                      currentDiagrams,
                      (diagramState) => ({ ...diagramState })
                    ) as typeof currentDiagrams

                    // Merge new views with current views
                    const views = mapValues(model.views, (newView) => {
                      const current = currentmodel?.views[newView.id]
                      const next = current && deepEqual(newView, current) ? current : newView

                      let diagramState = diagrams[newView.id]
                      if (!diagramState) {
                        diagrams[newView.id] = {
                          state: 'pending',
                          view: null,
                          error: null
                        }
                      } else if (next !== current) {
                        diagramState.state = 'stale'
                      }
                      return next
                    }) as typeof model.views

                    forEachObj(diagrams, (diagramState, id) => {
                      if (id in views) {
                        return
                      }
                      diagramState.state = 'error'
                      diagramState.error = 'View is not found'
                    })

                    set(
                      {
                        likeC4Model: {
                          ...model,
                          views
                        },
                        diagrams
                      },
                      noReplace,
                      'likeC4Model'
                    )
                  }

                  // const indexId = 'index' as ViewID
                  // const viewId = computedView?.id ?? diagram?.id ?? indexId
                  // await get().openView(viewId)
                  // if (!deepEqual(updatedView, computedView) || isNullish(diagram)) {
                  //   set({ computedView: updatedView })

                  // }
                } catch (e) {
                  console.error(e)
                } finally {
                  if (!get().modelFetched) {
                    set({ modelFetched: true }, noReplace, 'modelFetched')
                  }
                  DEV && console.timeEnd(label)
                }
              })
            },

            openView: (viewId) => {
              const { likeC4Model, viewId: currentViewId } = get()
              // const nextView = likeC4Model?.views[viewId as ViewID] ?? null
              set({
                viewId: viewId as ViewID
              })
              if (viewId !== currentViewId) {
                get().showLocation({ view: viewId as ViewID })
              }
              // try {

              //   if (!nextView || deepEqual(nextView, computedView)) {
              //     return
              //   }
              //   set({computedView: null},
              //       noReplace,
              //       'fetchDiagram'
              //     )
              //   if () {
              //     // if (isNullish(computeView)) {
              //     //   // do nothing
              //     //   return
              //     // }
              //     // if (isNullish(diagram) || diagram.id !== viewId) {
              //     //   await layoutView()
              //     // }
              //     // already opened
              //     return
              //   }
              //   const { view } = await client.sendRequest(computeView, { viewId })
              //   if (deepEqual(view, computedView)) {
              //     return
              //   }
              //   if (!view) {
              //     set(
              //       {
              // z        computedView: null
              //       },
              //       noReplace,
              //       'fetchDiagram'
              //     )
              //     return
              //   }
              //   const layoutRes = await graphvizLayouter.layout(view).catch(e => {
              //     console.error(e)
              //     return {
              //       diagram: null,
              //       dot: null
              //     }
              //   })
              //   set(
              //     {
              //       computedView: view,
              //       diagram: layoutRes.diagram,
              //       diagramAsDot: layoutRes.dot
              //     },
              //     noReplace,
              //     'fetchDiagram'
              //   )
              //   if (view.id !== computedView?.id) {
              //     get().showLocation({ view: view.id })
              //   }
              // } catch (e) {
              //   console.error(e)
              // } finally {
              //   DEV && console.timeEnd(label)
              // }
            },

            layoutView: () => {
              const client = get().languageClient()
              invariant(client, 'Language client is not initialized')
              if (layoutLimit.pendingCount > 0) {
                console.warn('clearing layoutLimit queue')
                layoutLimit.clearQueue()
              }
              layoutLimit(async () => {
                const { likeC4Model, viewId, diagrams: currentDiagrams } = get()

                const computedView = likeC4Model?.views[viewId] ?? null
                if (!computedView) {
                  // Do nothing
                  return
                }

                const diagrams = {
                  ...currentDiagrams
                }

                const label = `layoutView: ${computedView.id}`
                console.time(label)
                console.log(`start ${label}`)
                try {
                  const layoutRes = await graphvizLayouter.layout(computedView)
                  diagrams[viewId] = {
                    view: layoutRes.diagram,
                    state: 'success',
                    error: null
                  }
                } catch (e) {
                  diagrams[viewId] = {
                    view: null,
                    state: 'error',
                    error: isError(e) ? e.message : 'Unknown error'
                  }
                } finally {
                  console.timeEnd(label)
                  set({ diagrams }, noReplace, 'layoutView')
                }
                return
              })
            },

            onChanges: ({ change }) => {
              const { languageClient, diagram } = get()
              invariant(diagram, 'Diagram is not initialized')
              const client = languageClient()
              invariant(client, 'Language client is not initialized')
              void client
                .sendRequest(changeView, {
                  viewId: diagram.id,
                  change
                })
                .then((location) => {
                  if (location) {
                    set({ requestedLocation: location })
                  }
                }, e => {
                  console.error(e)
                })
            },

            showLocation: async (request) => {
              const { languageClient } = get()
              const client = languageClient()
              invariant(client, 'Language client is not initialized')
              const location = await client.sendRequest(locate, request)
              if (location) {
                set({ requestedLocation: location })
              }
            }
          }),
          {
            name: `WorkspaceStore ${storeDevId++} - ${name}`,
            enabled: DEV
          }
        )
      ),
      {
        name: `likec4:workspace:${name}`,
        partialize: (s: WorkspaceState) => ({
          name: s.name,
          title: s.title,
          currentFilename: s.currentFilename,
          files: s.files,
          originalFiles: s.originalFiles
        }),
        merge: (persistedState, currentState) => mergeDeep(currentState, persistedState as any),
        skipHydration: skipHydration ?? false,
        onRehydrateStorage({ name, title }) {
          try {
            const jsonworkspaces = localStorage.getItem(LikeC4WorkspacesKey) ?? '[]'
            const workspaces = JSON.parse(jsonworkspaces) as Array<LocalStorageWorkspace>
            if (!workspaces.some((w) => w.name === name)) {
              workspaces.push({
                key: `likec4:workspace:${name}`,
                name,
                title
              })
              localStorage.setItem(LikeC4WorkspacesKey, JSON.stringify(workspaces))
            }
          } catch (e) {
            console.error(e)
          }
        }
      }
    ),
    shallow
  )
}

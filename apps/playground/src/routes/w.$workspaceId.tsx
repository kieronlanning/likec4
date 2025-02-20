import { AppShell, AppShellHeader, AppShellMain, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Examples } from '../examples'
// import { useWorkspaceState, WorkspaceContextProvider } from '../state'
// import { EditorPanel } from './-workspace/EditorPanel'
// import { Header } from './-workspace/Header'
import { MonacoEditor } from '$/monaco'
import { Header } from '$components/appshell/Header'
// import { PlaygroundActorProvider } from '$state/context'
import { WorkspaceFileTabs } from '$components/workspace/WorkspaceFileTabs'
import { PlaygroundActorContextProvider } from '$state/context'
import { WorkspacePersistence } from '$state/persistence'
import * as css from './styles.css'

export const Route = createFileRoute('/w/$workspaceId')({
  component: WorkspaceContextPage,
  loader: ({ params }): {
    workspaceId: string
    activeFilename: string
    title: string
    files: Record<string, string>
  } => {
    const id = params.workspaceId as keyof typeof Examples
    if (Examples[id]) {
      return {
        workspaceId: id,
        activeFilename: Examples[id].currentFilename,
        title: Examples[id].title,
        files: Examples[id].files,
      }
    }
    return WorkspacePersistence.read(id) ?? {
      workspaceId: id,
      activeFilename: Examples.blank.currentFilename,
      ...Examples.blank,
    }
  },
})

function WorkspaceContextPage() {
  // const { workspaceId } = Route.useParams()
  const workspace = Route.useLoaderData()

  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <PlaygroundActorContextProvider workspace={workspace}>
      <AppShell header={{ height: 50 }}>
        <AppShellHeader>
          <Header />
        </AppShellHeader>
        <AppShellMain h={'100dvh'}>
          <PanelGroup
            direction={isMobile ? 'vertical' : 'horizontal'}
            autoSaveId={`playground`}>
            <Panel
              className={css.panel}
              collapsible={true}
              minSize={5}
              defaultSize={40}>
              <Stack h="100%" gap={0}>
                <WorkspaceFileTabs />
                <MonacoEditor />
              </Stack>
            </Panel>
            <PanelResizeHandle
              className={css.resize}
              style={{
                padding: isMobile ? '1px 0' : '0 1px',
              }} />
            <Panel className={css.panel}>
              <Outlet />
            </Panel>
          </PanelGroup>
        </AppShellMain>
      </AppShell>
    </PlaygroundActorContextProvider>
  )
}

import { Box, Code, ScrollArea } from '@mantine/core'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { d2Source } from 'virtual:likec4/d2-sources'
import { CopyToClipboard } from '../components'

export const Route = createFileRoute('/view/$viewId/d2')({
  component: ViewAsD2
})

function ViewAsD2() {
  const { viewId } = Route.useRouteContext()
  const source = d2Source(viewId)
  return (
    <PanelGroup direction="horizontal" autoSaveId="viewAsD2">
      <Panel>
        <ScrollArea>
          <Code block>
            {source}
          </Code>
          <CopyToClipboard text={source} />
        </ScrollArea>
      </Panel>
      <PanelResizeHandle
        style={{
          width: 10
        }}
      />
      <Panel>
        <ScrollArea>
        </ScrollArea>
      </Panel>
    </PanelGroup>
  )
}

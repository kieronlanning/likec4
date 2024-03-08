import { Box, Code, ScrollArea } from '@mantine/core'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { dotSource, svgSource } from 'virtual:likec4/dot-sources'

export const Route = createFileRoute('/view/$viewId/dot')({
  component: ViewAsDot
})

function ViewAsDot() {
  const { viewId } = Route.useRouteContext()
  const dot = dotSource(viewId)
  return (
    <PanelGroup direction="horizontal" autoSaveId="viewAsDot">
      <Panel>
        <ScrollArea>
          <Code block>
            {dot}
          </Code>
        </ScrollArea>
      </Panel>
      <PanelResizeHandle
        style={{
          width: 10
        }}
      />
      <Panel>
        <ScrollArea>
          <div dangerouslySetInnerHTML={{ __html: svgSource(viewId) }}></div>
        </ScrollArea>
      </Panel>
    </PanelGroup>
  )
}

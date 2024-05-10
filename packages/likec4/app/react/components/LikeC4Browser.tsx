import '@mantine/core/styles.css'
import '@xyflow/react/dist/style.css'

import { LikeC4Diagram, useUpdateEffect } from '@likec4/diagram'
import { ActionIcon, Group, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, ModalRoot } from '@mantine/core'
import { useStateHistory } from '@mantine/hooks'
import { useMountEffect } from '@react-hookz/web'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useId, useState } from 'react'
import { cssDiagram, historyButtons, modalBody, modalCloseButton, modalContent } from './LikeC4Browser.css'
import { ShadowRoot } from './ShadowRoot'
import { useColorScheme } from './styles'
import { cssLikeC4Browser } from './styles.css'
import type { DiagramView, LikeC4ViewBaseProps } from './types'

export type LikeC4BrowserProps<ViewID extends string> = Omit<LikeC4ViewBaseProps<ViewID>, 'viewId' | 'interactive'> & {
  view: DiagramView<ViewID>
  onNavigateTo: (to: ViewID) => void
  onClose: () => void
}

export function LikeC4Browser<ViewID extends string>({
  colorScheme,
  view,
  injectFontCss,
  onNavigateTo,
  onClose,
  ...props
}: LikeC4BrowserProps<ViewID>) {
  const id = useId()
  const scheme = useColorScheme(colorScheme)
  const [opened, setOpened] = useState(false)

  const [historyViewId, historyOps, {
    history,
    current: historyIndex
  }] = useStateHistory(view.id)

  const hasBack = historyIndex > 0
  const hasForward = historyIndex < history.length - 1

  useUpdateEffect(() => {
    if (view.id !== historyViewId) {
      historyOps.set(view.id)
    }
  }, [view.id])

  useUpdateEffect(() => {
    if (view.id !== historyViewId) {
      onNavigateTo(historyViewId)
    }
  }, [historyViewId])

  useMountEffect(() => {
    setOpened(true)
  })
  const closeMe = () => {
    setOpened(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  return (
    <>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: `
        [data-likec4-instance="${id}"] {
          position: fixed;
          inset: 0;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          z-index: 9999;
          width: 100%;
          height: 100%;
        }
      `
        }} />
      <ShadowRoot
        colorScheme={scheme}
        injectFontCss={injectFontCss}
        rootClassName={cssLikeC4Browser}
        data-likec4-instance={id}
        {...props}>
        <ModalRoot
          opened={opened}
          fullScreen
          withinPortal={false}
          onClose={closeMe}>
          <ModalOverlay blur={16} fixed={false} backgroundOpacity={0.5} />
          <ModalContent className={modalContent}>
            <ModalCloseButton className={modalCloseButton} />
            <ModalBody className={modalBody}>
              <LikeC4Diagram
                className={cssDiagram}
                view={view as any}
                readonly
                pannable
                zoomable
                fitView
                fitViewPadding={0.05}
                controls={false}
                nodesSelectable={false}
                nodesDraggable={false}
                keepAspectRatio={false}
                onNavigateTo={to => onNavigateTo(to as string as ViewID)}
              />
              <Group className={historyButtons} gap={'xs'}>
                {hasBack && (
                  <ActionIcon variant="light" color="gray" size={'lg'} onClick={() => historyOps.back()}>
                    <IconChevronLeft />
                  </ActionIcon>
                )}
                {hasForward && (
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size={'lg'}
                    onClick={() => historyOps.forward()}>
                    <IconChevronRight />
                  </ActionIcon>
                )}
              </Group>
            </ModalBody>
          </ModalContent>
        </ModalRoot>
      </ShadowRoot>
    </>
  )
}

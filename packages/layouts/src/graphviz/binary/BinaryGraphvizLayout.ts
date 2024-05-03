import type { ComputedView } from '@likec4/core'
import { execa } from 'execa'
import pLimit from 'p-limit'
import { parseGraphvizJson } from '../dotLayout'
import type { GraphvizLayouter } from '../DotLayouter'
import { printToDot } from '../printToDot'
import type { DotLayoutResult, DotSource } from '../types'

const limit = pLimit(2)

export class BinaryGraphvizLayouter implements GraphvizLayouter {
  constructor(
    // Path to the binary, e.g. 'dot' or '/usr/bin/dot'
    public path: string = 'dot'
  ) {
  }

  dispose(): void {
    // no-op
  }

  async layout(view: ComputedView): Promise<DotLayoutResult> {
    return await limit(async () => {
      // console.debug(`[BinaryGraphvizLayouter.layout] view=${view.id}`)
      let dot = printToDot(view)
      const unflatten = await execa('unflatten', ['-f', '-l 1', '-c 2'], {
        reject: false,
        timeout: 5_000,
        input: dot,
        stdin: 'pipe',
        encoding: 'utf8'
      })
      if (unflatten instanceof Error) {
        if (unflatten.stdout) {
          console.warn(
            `[BinaryGraphvizLayouter.layout] '${unflatten.command}' failed: ${unflatten.stderr}\n\nbut returned\n${unflatten.stdout}`
          )
        } else {
          console.error(
            `[BinaryGraphvizLayouter.layout] '${unflatten.command}' failed: ${unflatten.stderr}\n\nnothing returned, ignoring...`
          )
        }
      }

      if (unflatten.stdout) {
        dot = unflatten.stdout.replaceAll(/\t\[/g, ' [').replaceAll(/\t/g, '    ') as DotSource
      }

      const dotcmd = await execa(this.path, ['-Tjson', '-y'], {
        reject: false,
        timeout: 5_000,
        input: dot,
        stdin: 'pipe',
        encoding: 'utf8'
      })
      if (dotcmd instanceof Error) {
        if (!dotcmd.stdout) {
          console.error(
            `[BinaryGraphvizLayouter.layout] '${dotcmd.command}' nothing returned and failed: ${dotcmd.stderr}`
          )
          throw dotcmd
        }
        console.warn(
          `[BinaryGraphvizLayouter.layout] '${dotcmd.command}' returned result but also failed ${dotcmd.stderr}`
        )
      }
      const diagram = parseGraphvizJson(dotcmd.stdout, view)
      return {
        dot,
        diagram
      }
    })
  }

  async svg(dot: string, _view: ComputedView): Promise<string> {
    return await limit(async () => {
      let svgFix = dot
        .split('\n')
        .filter(l => !l.includes('margin=33.21'))
        .join('\n')
      const result = await execa(this.path, ['-Tsvg', '-y'], {
        reject: false,
        timeout: 5_000,
        input: svgFix,
        stdin: 'pipe',
        encoding: 'utf8'
      })

      if (result instanceof Error) {
        if (!result.stdout) {
          console.error(
            `[BinaryGraphvizLayouter.layout] '${result.command}' nothing returned and failed: ${result.stderr}`
          )
          throw result
        }
        console.warn(
          `[BinaryGraphvizLayouter.layout] '${result.command}' returned result but also failed ${result.stderr}`
        )
      }
      return result.stdout
    })
  }
}

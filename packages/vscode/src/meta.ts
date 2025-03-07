// This file is generated by `vscode-ext-gen`. Do not modify manually.
// @see https://github.com/antfu/vscode-ext-gen

// Meta info
export const publisher = "likec4"
export const name = "likec4-vscode"
export const version = "1.24.1"
export const displayName = "LikeC4"
export const description = "Support for the LikeC4 modeling language"
export const extensionId = `${publisher}.${name}`

/**
 * Type union of all commands
 */
export type CommandKey = 
  | "likec4.open-preview"
  | "likec4.restart"
  | "likec4.preview-context-open-source"
  | "likec4.locate"
  | "likec4.print-dot-of-currentview"
  | "likec4.validate-layout"

/**
 * Commands map registed by `likec4.likec4-vscode`
 */
export const commands = {
  /**
   * %ext.cmd.open-preview%
   * @value `likec4.open-preview`
   */
  openPreview: "likec4.open-preview",
  /**
   * %ext.cmd.restart%
   * @value `likec4.restart`
   */
  restart: "likec4.restart",
  /**
   * %ext.cmd.preview-context-open-source%
   * @value `likec4.preview-context-open-source`
   */
  previewContextOpenSource: "likec4.preview-context-open-source",
  /**
   * %ext.cmd.locate%
   * @value `likec4.locate`
   */
  locate: "likec4.locate",
  /**
   * %ext.cmd.print-dot-of-currentview%
   * @value `likec4.print-dot-of-currentview`
   */
  printDotOfCurrentview: "likec4.print-dot-of-currentview",
  /**
   * %ext.cmd.validate-layout%
   * @value `likec4.validate-layout`
   */
  validateLayout: "likec4.validate-layout",
} satisfies Record<string, CommandKey>

/**
 * Type union of all configs
 */
export type ConfigKey = 
  | "likec4.graphviz.mode"
  | "likec4.graphviz.path"
  | "likec4.trace.extension"
  | "likec4.trace.server"

export interface ConfigKeyTypeMap {
  "likec4.graphviz.mode": ("wasm" | "binary"),
  "likec4.graphviz.path": string,
  "likec4.trace.extension": ("off" | "messages" | "verbose"),
  "likec4.trace.server": ("off" | "messages" | "verbose"),
}

export interface ConfigShorthandMap {
  graphvizMode: "likec4.graphviz.mode",
  graphvizPath: "likec4.graphviz.path",
  traceExtension: "likec4.trace.extension",
  traceServer: "likec4.trace.server",
}

export interface ConfigShorthandTypeMap {
  graphvizMode: ("wasm" | "binary"),
  graphvizPath: string,
  traceExtension: ("off" | "messages" | "verbose"),
  traceServer: ("off" | "messages" | "verbose"),
}

export interface ConfigItem<T extends keyof ConfigKeyTypeMap> {
  key: T,
  default: ConfigKeyTypeMap[T],
}


/**
 * Configs map registered by `likec4.likec4-vscode`
 */
export const configs = {
  /**
   * If you are experiencing issues with the bundled WASM Graphviz, try switch to local binary ("dot")
   * @key `likec4.graphviz.mode`
   * @default `"wasm"`
   * @type `string`
   */
  graphvizMode: {
    key: "likec4.graphviz.mode",
    default: "wasm",
  } as ConfigItem<"likec4.graphviz.mode">,
  /**
   * Path to the Graphviz dot executable.
   * If empty, extension will try to find it in the PATH.
   * @key `likec4.graphviz.path`
   * @default `""`
   * @type `string`
   */
  graphvizPath: {
    key: "likec4.graphviz.path",
    default: "",
  } as ConfigItem<"likec4.graphviz.path">,
  /**
   * Enable trace logging for the LikeC4 extension.
   * @key `likec4.trace.extension`
   * @default `"off"`
   * @type `string`
   */
  traceExtension: {
    key: "likec4.trace.extension",
    default: "off",
  } as ConfigItem<"likec4.trace.extension">,
  /**
   * Traces the communication between VS Code and the LikeC4 language server.
   * @key `likec4.trace.server`
   * @default `"off"`
   * @type `string`
   */
  traceServer: {
    key: "likec4.trace.server",
    default: "off",
  } as ConfigItem<"likec4.trace.server">,
}

export interface ScopedConfigKeyTypeMap {
  "graphviz.mode": ("wasm" | "binary"),
  "graphviz.path": string,
  "trace.extension": ("off" | "messages" | "verbose"),
  "trace.server": ("off" | "messages" | "verbose"),
}

export const scopedConfigs = {
  scope: "likec4",
  defaults: {
    "graphviz.mode": "wasm",
    "graphviz.path": "",
    "trace.extension": "off",
    "trace.server": "off",
  } satisfies ScopedConfigKeyTypeMap,
}

export interface NestedConfigs {
  "likec4": {
    "graphviz": {
      "mode": ("wasm" | "binary"),
      "path": string,
    },
    "trace": {
      "extension": ("off" | "messages" | "verbose"),
      "server": ("off" | "messages" | "verbose"),
    },
  },
}

export interface NestedScopedConfigs {
  "graphviz": {
    "mode": ("wasm" | "binary"),
    "path": string,
  },
  "trace": {
    "extension": ("off" | "messages" | "verbose"),
    "server": ("off" | "messages" | "verbose"),
  },
}


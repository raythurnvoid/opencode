import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { app_opencode_apis_adapter } from "../app_opencode_adapter"

export namespace Tool {
  interface Metadata {
    [key: string]: any
  }
  export type Context<M extends Metadata = Metadata> = {
    sessionID: string
    messageID: string
    callID?: string
    abort: AbortSignal
    metadata(input: { title?: string; metadata?: M }): void
    appOpenCodeDbAdapters: {
      fs: {
        readdirSync: (path: string) => Promise<string[]>
      }
      FileTime: {
        read: (sessionID: string, filepath: string) => Promise<void>
      }
      Bun: {
        file: (filepath: string) => Promise<app_opencode_apis_adapter.Bun.BunFile>
      }
      Glob: {
        scan: (pattern: string, options: { cwd: string; dot?: boolean }) => Promise<string[]>
        match: (pattern: string, path: string) => boolean
      }
    }
  }
  export interface Info<Parameters extends StandardSchemaV1 = StandardSchemaV1, M extends Metadata = Metadata> {
    id: string
    init: () => Promise<{
      description: string
      parameters: Parameters
      execute(
        args: StandardSchemaV1.InferOutput<Parameters>,
        ctx: Context,
      ): Promise<{
        title: string
        metadata: M
        output: string
      }>
    }>
  }

  export function define<Parameters extends StandardSchemaV1, Result extends Metadata>(
    id: string,
    init: Info<Parameters, Result>["init"] | Awaited<ReturnType<Info<Parameters, Result>["init"]>>,
  ): Info<Parameters, Result> {
    return {
      id,
      init: async () => {
        if (init instanceof Function) return init()
        return init
      },
    }
  }
}

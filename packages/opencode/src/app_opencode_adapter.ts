/*
The goal of this adapter module is to re-use Open Code module in the app (package/app).

Open Code is an agentic terminal application that allows to read and write files, it's primary
target is for coding.

Open Code works on top of a file system while our app works on top of a database.

In the database we have a tree structure of "Pages" (Notion like elements that can have nested items).

The tree structure allows us to emulate a file system, therefore we can replace fs read and write
operations with queries and mutations to the database (we use Convex).

The goal of this adapter is to allow us to keep the Open Code code almost unchanged, while
hooking our custom implementation for file system operations.
*/

export namespace app_opencode_apis_adapter {
  export namespace path {
    export function isAbsolute(path: string): boolean {
      const normalizedPath = path.replaceAll("\\", "/")
      return normalizedPath.startsWith("/")
    }

    export function join(...paths: string[]): string {
      const joinedPath = paths.join("/")
      const normalizedPath = joinedPath.replaceAll("\\", "/")
      const dedupedSeparatorsPath = normalizedPath.replaceAll("//", "/")
      return dedupedSeparatorsPath
    }

    export function dirname(path: string): string {
      const normalizedPath = path.replaceAll("\\", "/")
      const lastSlashIndex = normalizedPath.lastIndexOf("/")

      if (lastSlashIndex === -1) {
        return "." // No directory separator found, return current directory
      }

      if (lastSlashIndex === 0) {
        return "/" // Root directory
      }

      return normalizedPath.substring(0, lastSlashIndex)
    }

    export function basename(path: string): string {
      const normalizedPath = path.replaceAll("\\", "/")
      const lastSlashIndex = normalizedPath.lastIndexOf("/")

      if (lastSlashIndex === -1) {
        return normalizedPath // No directory separator found, return entire path
      }

      return normalizedPath.substring(lastSlashIndex + 1)
    }

    export function relative(from: string, to: string): string {
      const normalizedFrom = from.replaceAll("\\", "/")
      const normalizedTo = to.replaceAll("\\", "/")

      const indexOfCommonPart = normalizedTo.indexOf(normalizedFrom)

      const trimmed = normalizedTo.substring(indexOfCommonPart + normalizedFrom.length)

      const relativePath = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed

      return relativePath
    }

    export function extname(path: string): string {
      const normalizedPath = path.replaceAll("\\", "/")
      const lastSlashIndex = normalizedPath.lastIndexOf("/")
      const lastDotIndex = normalizedPath.lastIndexOf(".")

      // If no dot found, or dot is before the last slash (part of directory name), no extension
      if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
        return ""
      }

      // Return extension including the dot
      return normalizedPath.substring(lastDotIndex)
    }

    export function resolve(from: string, to: string): string {
      const normalizedFrom = from.replaceAll("\\", "/").replaceAll("//", "/")
      const normalizedTo = to.replaceAll("\\", "/").replaceAll("//", "/")

      // If to is already absolute, return it
      if (normalizedTo.startsWith("/")) {
        return normalizedTo
      }

      // Join from and to, ensuring proper path format
      const joined = `${normalizedFrom}/${normalizedTo}`.replaceAll("//", "/")
      return joined.startsWith("/") ? joined : `/${joined}`
    }
  }

  export namespace Filesystem {
    export function contains(parent: string, child: string): boolean {
      const normalizedParent = parent.replaceAll("\\", "/")
      const normalizedChild = child.replaceAll("\\", "/")

      const absoluteParent = normalizedParent.startsWith("/") ? normalizedParent : `/${normalizedParent}`
      const absoluteChild = normalizedChild.startsWith("/") ? normalizedChild : `/${normalizedChild}`

      return absoluteChild.startsWith(absoluteParent)
    }
  }

  export namespace LSP {
    export function touchFile(_path: string, _waitForDiagnostics: boolean) {
      // noop
    }
  }

  export namespace App {
    export function info() {
      return {
        path: {
          cwd: "/",
          root: "/",
        },
      }
    }
  }

  export namespace Bun {
    export type BunFile = {
      exists: () => Promise<boolean>
      text: () => Promise<string>
      arrayBuffer: () => Promise<ArrayBuffer>
    }
  }

  export namespace process {
    export function cwd(): string {
      return "/"
    }
  }
}

declare global {
  export const convex: {}
}

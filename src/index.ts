import type { RemoteBuildCachePlugin, ResolveRemoteBuildCacheProps, UploadRemoteBuildCacheProps } from "@expo/config"
import fs from "fs-extra"
import path from "path"
import { downloadAndMaybeExtractAppAsync } from "./download"
import { createReleaseAndUploadAsset, getReleaseAssetsByTag } from "./github"
import { getBuildRunCacheDirectoryPath, isDevClientBuild } from "./helpers"
import { RunOptions } from "./types"

const resolveRemoteBuildCache = async (
  { projectRoot, platform, fingerprintHash, runOptions }: ResolveRemoteBuildCacheProps,
  { owner, repo }: { owner: string; repo: string }
): Promise<string | null> => {
  if (!runOptions.buildCache) {
    console.log("Build cache is disabled, skipping download")
    return null
  }

  const cachedAppPath = getCachedAppPath({ fingerprintHash, platform, projectRoot, runOptions })

  if (fs.existsSync(cachedAppPath)) {
    console.log("Cached build found, skipping download")
    return cachedAppPath
  }

  console.log(`Searching builds with matching fingerprint on Github Releases`)

  try {
    const tag = getTagName({ fingerprintHash, projectRoot, runOptions, platform })
    const assets = await getReleaseAssetsByTag({ token: process.env.GITHUB_TOKEN!, owner, repo, tag })
    const buildDownloadURL = assets[0].url
    return await downloadAndMaybeExtractAppAsync(buildDownloadURL, platform, cachedAppPath)
  } catch (error) {
    console.log("No cached builds available for this fingerprint")
  }

  return null
}

const uploadRemoteBuildCache = async (
  { projectRoot, fingerprintHash, runOptions, buildPath, platform }: UploadRemoteBuildCacheProps,
  { owner, repo }: { owner: string; repo: string }
): Promise<string | null> => {
  console.log(`Uploading build to Github Releases`)

  try {
    const tagName = getTagName({ fingerprintHash, projectRoot, runOptions, platform })
    return await createReleaseAndUploadAsset({ token: process.env.GITHUB_TOKEN!, owner, repo, tagName, binaryPath: buildPath })
  } catch (error) {
    console.error("Release failed:", error instanceof Error ? error.message : "Unknown error")
  }

  return null
}

function getTagName({
  fingerprintHash,
  projectRoot,
  runOptions,
  platform,
}: {
  fingerprintHash: string
  projectRoot: string
  runOptions: RunOptions
  platform: "ios" | "android"
}): string {
  const isDevClient = isDevClientBuild({ projectRoot, runOptions })
  return `fingerprint.${fingerprintHash}${isDevClient || true ? ".dev-client" : ""}.${platform}`
}

function getCachedAppPath({ fingerprintHash, platform, projectRoot, runOptions }: ResolveRemoteBuildCacheProps): string {
  return path.join(
    getBuildRunCacheDirectoryPath(),
    `${getTagName({ fingerprintHash, projectRoot, runOptions, platform })}.${platform === "ios" ? "app" : "apk"}`
  )
}

export default { resolveRemoteBuildCache, uploadRemoteBuildCache } satisfies RemoteBuildCachePlugin

import * as path from "path"
import fs from "fs/promises"

import NodeCache from "node-cache"

import { ContextProxy } from "../../../core/config/ContextProxy"
import { getCacheDirectoryPath } from "../../../shared/storagePathManager"
import { RouterName, ModelRecord } from "../../../shared/api"
import { fileExistsAtPath } from "../../../utils/fs"

const memoryCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 5 * 60 })

async function readModels(router: RouterName): Promise<ModelRecord | undefined> {
	const filename = `${router}_models.json`
	const cacheDir = await getCacheDirectoryPath(ContextProxy.instance.globalStorageUri.fsPath)
	const filePath = path.join(cacheDir, filename)
	const exists = await fileExistsAtPath(filePath)
	return exists ? JSON.parse(await fs.readFile(filePath, "utf8")) : undefined
}

/**
 * Get models from the cache or fetch them from the provider and cache them.
 * There are two caches:
 * 1. Memory cache - This is a simple in-memory cache that is used to store models for a short period of time.
 * 2. File cache - This is a file-based cache that is used to store models for a longer period of time.
 *
 * @param router - The router to fetch models from.
 * @returns The models from the cache or the fetched models.
 */
export const getModels = async (router: RouterName): Promise<ModelRecord> => {
	let models = memoryCache.get<ModelRecord>(router)

	if (models) {
		// console.log(`[getModels] NodeCache hit for ${router} -> ${Object.keys(models).length}`)
		return models
	}

	try {
		models = await readModels(router)
		// console.log(`[getModels] read ${router} models from file cache`)
	} catch (error) {}

	return models ?? {}
}

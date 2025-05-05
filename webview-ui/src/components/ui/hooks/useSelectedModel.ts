import {
	ApiConfiguration,
	RouterModels,
	ModelInfo,
	anthropicDefaultModelId,
	anthropicModels,
	bedrockDefaultModelId,
	bedrockModels,
	deepSeekDefaultModelId,
	deepSeekModels,
	geminiDefaultModelId,
	geminiModels,
	mistralDefaultModelId,
	mistralModels,
	openAiModelInfoSaneDefaults,
	openAiNativeDefaultModelId,
	openAiNativeModels,
	vertexDefaultModelId,
	vertexModels,
	xaiDefaultModelId,
	xaiModels,
	vscodeLlmModels,
	vscodeLlmDefaultModelId,
	openRouterDefaultModelId,
	requestyDefaultModelId,
	glamaDefaultModelId,
	unboundDefaultModelId,
} from "@roo/shared/api"

import { useRouterModels } from "./useRouterModels"

export const useSelectedModel = (apiConfiguration?: ApiConfiguration) => {
	const { data: routerModels, isLoading, isError } = useRouterModels()
	const provider = apiConfiguration?.apiProvider || "anthropic"
	const id = apiConfiguration ? getSelectedModelId({ provider, apiConfiguration }) : anthropicDefaultModelId
	const info = routerModels ? getSelectedModelInfo({ provider, id, apiConfiguration, routerModels }) : undefined
	return { provider, id, info, isLoading, isError }
}

function getSelectedModelId({ provider, apiConfiguration }: { provider: string; apiConfiguration: ApiConfiguration }) {
	switch (provider) {
		case "openrouter":
			return apiConfiguration.openRouterModelId ?? openRouterDefaultModelId
		case "requesty":
			return apiConfiguration.requestyModelId ?? requestyDefaultModelId
		case "glama":
			return apiConfiguration.glamaModelId ?? glamaDefaultModelId
		case "unbound":
			return apiConfiguration.unboundModelId ?? unboundDefaultModelId
		case "openai":
			return apiConfiguration.openAiModelId || ""
		case "ollama":
			return apiConfiguration.ollamaModelId || ""
		case "lmstudio":
			return apiConfiguration.lmStudioModelId || ""
		case "vscode-lm":
			return apiConfiguration?.vsCodeLmModelSelector
				? `${apiConfiguration.vsCodeLmModelSelector.vendor}/${apiConfiguration.vsCodeLmModelSelector.family}`
				: ""
		default:
			return apiConfiguration.apiModelId ?? anthropicDefaultModelId
	}
}

function getSelectedModelInfo({
	provider,
	id,
	apiConfiguration,
	routerModels,
}: {
	provider: string
	id: string
	apiConfiguration?: ApiConfiguration
	routerModels: RouterModels
}): ModelInfo {
	switch (provider) {
		case "openrouter":
			return routerModels.openrouter[id] ?? routerModels.openrouter[openRouterDefaultModelId]
		case "requesty":
			return routerModels.requesty[id] ?? routerModels.requesty[requestyDefaultModelId]
		case "glama":
			return routerModels.glama[id] ?? routerModels.glama[glamaDefaultModelId]
		case "unbound":
			return routerModels.unbound[id] ?? routerModels.unbound[unboundDefaultModelId]
		case "xai":
			return xaiModels[id as keyof typeof xaiModels] ?? xaiModels[xaiDefaultModelId]
		case "bedrock":
			// Special case for custom ARN.
			if (id === "custom-arn") {
				return {
					// defaults to cross Claude model compatible safe values if not set in apiConfiguration
					maxTokens: apiConfiguration?.awsCustomArnMaxOutputTokens || 8192,
					contextWindow: apiConfiguration?.awsCustomArnInputContextTokens || 200_000,
					supportsImages: apiConfiguration?.awsCustomArnSupportsImages || false,
					supportsComputerUse: apiConfiguration?.awsCustomArnSupportsComputerUse || false,
					supportsPromptCache: apiConfiguration?.awsCustomArnSupportsPromptCaching || false,
					inputPrice: apiConfiguration?.awsCustomArnInputPrice || 3.0,
					outputPrice: apiConfiguration?.awsCustomArnOutputPrice || 15.0,
					cacheWritesPrice: apiConfiguration?.awsCustomArnCacheWritesPrice || 3.75,
					cacheReadsPrice: apiConfiguration?.awsCustomArnCacheReadsPrice || 0.3,
					minTokensPerCachePoint: apiConfiguration?.awsCustomArnMinTokensPerCachePoint || 1024,
					maxCachePoints: apiConfiguration?.awsCustomArnMaxCachePoints || 4,
					cachableFields: typeof apiConfiguration?.awsCustomArnCachableFields === "string"
						? apiConfiguration.awsCustomArnCachableFields.split(",").map(f => f.trim()).filter(Boolean)
						: [],
				}
			}

			return bedrockModels[id as keyof typeof bedrockModels] ?? bedrockModels[bedrockDefaultModelId]
		case "vertex":
			return vertexModels[id as keyof typeof vertexModels] ?? vertexModels[vertexDefaultModelId]
		case "gemini":
			return geminiModels[id as keyof typeof geminiModels] ?? geminiModels[geminiDefaultModelId]
		case "deepseek":
			return deepSeekModels[id as keyof typeof deepSeekModels] ?? deepSeekModels[deepSeekDefaultModelId]
		case "openai-native":
			return (
				openAiNativeModels[id as keyof typeof openAiNativeModels] ??
				openAiNativeModels[openAiNativeDefaultModelId]
			)
		case "mistral":
			return mistralModels[id as keyof typeof mistralModels] ?? mistralModels[mistralDefaultModelId]
		case "openai":
			return apiConfiguration?.openAiCustomModelInfo || openAiModelInfoSaneDefaults
		case "ollama":
			return openAiModelInfoSaneDefaults
		case "lmstudio":
			return openAiModelInfoSaneDefaults
		case "vscode-lm":
			const modelFamily = apiConfiguration?.vsCodeLmModelSelector?.family ?? vscodeLlmDefaultModelId

			return {
				...openAiModelInfoSaneDefaults,
				...vscodeLlmModels[modelFamily as keyof typeof vscodeLlmModels],
				supportsImages: false, // VSCode LM API currently doesn't support images.
			}
		default:
			return anthropicModels[id as keyof typeof anthropicModels] ?? anthropicModels[anthropicDefaultModelId]
	}
}

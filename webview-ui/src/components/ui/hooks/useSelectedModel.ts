import {
	type ProviderName,
	type ApiConfiguration,
	type ModelInfo,
	anthropicDefaultModelId,
	anthropicModels,
	openAiModelInfoSaneDefaults,
	vscodeLlmModels,
	vscodeLlmDefaultModelId,
} from "@roo/shared/api"

export const useSelectedModel = (apiConfiguration?: ApiConfiguration) => {
	// const { data: routerModels, isLoading, isError } = useRouterModels()
	// Always default to bedrock if no provider is specified
	const provider = apiConfiguration?.apiProvider || "bedrock"

	const { id, info } = getSelectedModel({ provider, apiConfiguration: apiConfiguration || {} as ApiConfiguration })

	return { provider, id, info, isLoading: false, isError: false }
}

function getSelectedModel({
	provider,
	apiConfiguration,
}: {
	provider: ProviderName
	apiConfiguration: ApiConfiguration
}): { id: string; info: ModelInfo } {
	switch (provider) {
		case "bedrock": {
			// const id = apiConfiguration.apiModelId ?? bedrockDefaultModelId
			
			// Special case for custom ARN.
			// if (apiConfiguration.awsCustomArn) {
				return {
					id: "custom-arn",
					info: {
						// defaults to cross Claude model compatible safe values if not set in apiConfiguration
						maxTokens: apiConfiguration?.awsCustomArnMaxOutputTokens || 8192,
						contextWindow: apiConfiguration?.awsCustomArnInputContextTokens || 200_000,
						supportsImages: apiConfiguration?.awsCustomArnSupportsImages || false,
						supportsComputerUse: apiConfiguration?.awsCustomArnSupportsComputerUse || false,
						supportsPromptCache: apiConfiguration?.awsCustomArnSupportsPromptCaching || false,
						thinking: apiConfiguration?.awsCustomArnThinking || false,
						maxThinkingTokens: apiConfiguration?.awsCustomArnMaxThinkingTokens || 8192,
						inputPrice: apiConfiguration?.awsCustomArnInputPrice || 3.0,
						outputPrice: apiConfiguration?.awsCustomArnOutputPrice || 15.0,
						cacheWritesPrice: apiConfiguration?.awsCustomArnCacheWritesPrice || 3.75,
						cacheReadsPrice: apiConfiguration?.awsCustomArnCacheReadsPrice || 0.3,
						minTokensPerCachePoint: apiConfiguration?.awsCustomArnMinTokensPerCachePoint || 1024,
						maxCachePoints: apiConfiguration?.awsCustomArnMaxCachePoints || 4,
						cachableFields: typeof apiConfiguration?.awsCustomArnCachableFields === "string"
							? apiConfiguration.awsCustomArnCachableFields.split(",").map(f => f.trim()).filter(Boolean)
							: []
					}
				}
			// }

			// const info = bedrockModels[id as keyof typeof bedrockModels]
			// return info ? { id, info } : { id: bedrockDefaultModelId, info: bedrockModels[bedrockDefaultModelId] }
		}
		case "vscode-lm": {
			const id = apiConfiguration?.vsCodeLmModelSelector
				? `${apiConfiguration.vsCodeLmModelSelector.vendor}/${apiConfiguration.vsCodeLmModelSelector.family}`
				: vscodeLlmDefaultModelId
			const modelFamily = apiConfiguration?.vsCodeLmModelSelector?.family ?? vscodeLlmDefaultModelId
			const info = vscodeLlmModels[modelFamily as keyof typeof vscodeLlmModels]
			return { id, info: { ...openAiModelInfoSaneDefaults, ...info, supportsImages: false } } // VSCode LM API currently doesn't support images.
		}
		default: {
			const id = apiConfiguration.apiModelId ?? anthropicDefaultModelId
			const info = anthropicModels[id as keyof typeof anthropicModels]
			return info ? { id, info } : { id: anthropicDefaultModelId, info: anthropicModels[anthropicDefaultModelId] }
		}
	}
}

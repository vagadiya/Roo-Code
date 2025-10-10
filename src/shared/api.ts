import {
	type ModelInfo,
	type ProviderSettings,
	type DynamicProvider,
	type LocalProvider,
	ANTHROPIC_DEFAULT_MAX_TOKENS,
	CLAUDE_CODE_DEFAULT_MAX_OUTPUT_TOKENS,
	isDynamicProvider,
	isLocalProvider,
} from "@roo-code/types"

// ApiHandlerOptions
// Extend ProviderSettings (minus apiProvider) with handler-specific toggles.
export type ApiHandlerOptions = Omit<ProviderSettings, "apiProvider"> & {
	/**
	 * When true and using GPT‑5 Responses API, include reasoning.summary: "auto"
	 * so the API returns reasoning summaries (we already parse and surface them).
	 * Defaults to true; set to false to disable summaries.
	 */
	enableGpt5ReasoningSummary?: boolean
	/**
	 * Optional override for Ollama's num_ctx parameter.
	 * When set, this value will be used in Ollama chat requests.
	 * When undefined, Ollama will use the model's default num_ctx from the Modelfile.
	 */
	ollamaNumCtx?: number
}

// RouterName

export type RouterName = DynamicProvider | LocalProvider

export const isRouterName = (value: string): value is RouterName => isDynamicProvider(value) || isLocalProvider(value)

export function toRouterName(value?: string): RouterName {
	if (value && isRouterName(value)) {
		return value
	}

	throw new Error(`Invalid router name: ${value}`)
}

// RouterModels

export type ModelRecord = Record<string, ModelInfo>

export type RouterModels = Record<RouterName, ModelRecord>

// Reasoning

export const shouldUseReasoningBudget = ({
	model,
	settings,
}: {
	model: ModelInfo
	settings?: ProviderSettings
}): boolean => !!model.requiredReasoningBudget || (!!model.supportsReasoningBudget && !!settings?.enableReasoningEffort)

export const shouldUseReasoningEffort = ({
	model,
	settings,
}: {
	model: ModelInfo
	settings?: ProviderSettings
}): boolean => {
	// If enableReasoningEffort is explicitly set to false, reasoning should be disabled
	if (settings?.enableReasoningEffort === false) {
		return false
	}

	// Otherwise, use reasoning if:
	// 1. Model supports reasoning effort AND settings provide reasoning effort, OR
	// 2. Model itself has a reasoningEffort property
	return (!!model.supportsReasoningEffort && !!settings?.reasoningEffort) || !!model.reasoningEffort
}

export const DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS = 16_384
export const DEFAULT_HYBRID_REASONING_MODEL_THINKING_TOKENS = 8_192
export const GEMINI_25_PRO_MIN_THINKING_TOKENS = 128

// Max Tokens

export const getModelMaxOutputTokens = ({
	modelId,
	model,
	settings,
	format,
}: {
	modelId: string
	model: ModelInfo
	settings?: ProviderSettings
	format?: "anthropic" | "openai" | "gemini" | "openrouter"
}): number | undefined => {
	// Check for Claude Code specific max output tokens setting
	if (settings?.apiProvider === "claude-code") {
		return settings.claudeCodeMaxOutputTokens || CLAUDE_CODE_DEFAULT_MAX_OUTPUT_TOKENS
	}

	if (shouldUseReasoningBudget({ model, settings })) {
		return settings?.modelMaxTokens || DEFAULT_HYBRID_REASONING_MODEL_MAX_TOKENS
	}

	const isAnthropicContext =
		modelId.includes("claude") ||
		format === "anthropic" ||
		(format === "openrouter" && modelId.startsWith("anthropic/"))

	// For "Hybrid" reasoning models, discard the model's actual maxTokens for Anthropic contexts
	if (model.supportsReasoningBudget && isAnthropicContext) {
		return ANTHROPIC_DEFAULT_MAX_TOKENS
	}

	// For Anthropic contexts, always ensure a maxTokens value is set
	if (isAnthropicContext && (!model.maxTokens || model.maxTokens === 0)) {
		return ANTHROPIC_DEFAULT_MAX_TOKENS
	}

	// If model has explicit maxTokens, clamp it to 20% of the context window
	// Exception: GPT-5 models should use their exact configured max output tokens
	if (model.maxTokens) {
		// Check if this is a GPT-5 model (case-insensitive)
		const isGpt5Model = modelId.toLowerCase().includes("gpt-5")

		// GPT-5 models bypass the 20% cap and use their full configured max tokens
		if (isGpt5Model) {
			return model.maxTokens
		}

		// All other models are clamped to 20% of context window
		return Math.min(model.maxTokens, Math.ceil(model.contextWindow * 0.2))
	}

	// For non-Anthropic formats without explicit maxTokens, return undefined
	if (format) {
		return undefined
	}

	// Default fallback
	return ANTHROPIC_DEFAULT_MAX_TOKENS
}

// GetModelsOptions

// Allow callers to always pass apiKey/baseUrl without excess property errors,
// while still enforcing required fields per provider where applicable.
type CommonFetchParams = {
	apiKey?: string
	baseUrl?: string
}

// Exhaustive, value-level map for all dynamic providers.
// If a new dynamic provider is added in packages/types, this will fail to compile
// until a corresponding entry is added here.
const dynamicProviderExtras = {
	openrouter: {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	"vercel-ai-gateway": {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	huggingface: {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	litellm: {} as { apiKey: string; baseUrl: string },
	deepinfra: {} as { apiKey?: string; baseUrl?: string },
	"io-intelligence": {} as { apiKey: string },
	requesty: {} as { apiKey?: string; baseUrl?: string },
	unbound: {} as { apiKey?: string },
	glama: {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	ollama: {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
	lmstudio: {} as {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
} as const satisfies Record<RouterName, object>

// Build the dynamic options union from the map, intersected with CommonFetchParams
// so extra fields are always allowed while required ones are enforced.
export type GetModelsOptions = {
	[P in keyof typeof dynamicProviderExtras]: ({ provider: P } & (typeof dynamicProviderExtras)[P]) & CommonFetchParams
}[RouterName]

export const APPROVED_BEDROCK_ARNS: string[] = [
  "arn:aws:bedrock:us-east-1:344087272340:application-inference-profile/o4ztgzanj4u7",
  "arn:aws:bedrock:us-east-1:344087272340:application-inference-profile/lnm56v9is2ym",
  "arn:aws:bedrock:us-east-1:344087272340:application-inference-profile/rwwfypv8botg",
  "arn:aws:bedrock:us-east-1:344087272340:application-inference-profile/jdcn03gofzvd",
  "arn:aws:bedrock:us-east-1:344087272340:application-inference-profile/a4ed7vmkaldf",
//   "arn:aws:bedrock:us-east-1:396913734285:application-inference-profile/7f9boiz9ouig",
//   "arn:aws:bedrock:us-east-1:396913734285:application-inference-profile/of8cznqafjnb",
//   "arn:aws:bedrock:us-east-1:396913734285:application-inference-profile/1cr3yg5f8l99",
//   "arn:aws:bedrock:us-east-1:272424424341:application-inference-profile/hspmi9my3rdw",
//   "arn:aws:bedrock:us-east-1:272424424341:application-inference-profile/xxn0s6vywtex",
//   "arn:aws:bedrock:us-east-1:272424424341:application-inference-profile/3u8vfdgyypba",
];

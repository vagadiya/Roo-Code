import { useMemo, useEffect } from "react"
import { Checkbox } from "vscrui"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { ApiConfiguration } from "@roo/shared/api"

import { validateBedrockArn } from "@src/utils/validate"
import { useAppTranslation } from "@src/i18n/TranslationContext"

type BedrockCustomArnProps = {
	apiConfiguration: ApiConfiguration
	setApiConfigurationField: (field: keyof ApiConfiguration, value: ApiConfiguration[keyof ApiConfiguration]) => void
}

export const BedrockCustomArn = ({ apiConfiguration, setApiConfigurationField }: BedrockCustomArnProps) => {
	const { t } = useAppTranslation()

	const validation = useMemo(() => {
		const { awsCustomArn, awsRegion } = apiConfiguration
		return awsCustomArn ? validateBedrockArn(awsCustomArn, awsRegion) : { isValid: true, errorMessage: undefined }
	}, [apiConfiguration])

	// Ensure awsCustomArnInputContextTokens defaults to 200_000 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnInputContextTokens) {
			setApiConfigurationField("awsCustomArnInputContextTokens", 200_000);
		}
	}, [apiConfiguration.awsCustomArnInputContextTokens, setApiConfigurationField])

	// Ensure awsCustomArnMaxOutputTokens defaults to 8192 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnMaxOutputTokens) {
			setApiConfigurationField("awsCustomArnMaxOutputTokens", 8192);
		}
	}, [apiConfiguration.awsCustomArnMaxOutputTokens, setApiConfigurationField])

	// Ensure awsCustomArnInputPrice defaults to 3 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnInputPrice) {
			setApiConfigurationField("awsCustomArnInputPrice", 3);
		}
	}, [apiConfiguration.awsCustomArnInputPrice, setApiConfigurationField])

	// Ensure awsCustomArnOutputPrice defaults to 15 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnOutputPrice) {
			setApiConfigurationField("awsCustomArnOutputPrice", 15);
		}
	}, [apiConfiguration.awsCustomArnOutputPrice, setApiConfigurationField])

	// Ensure awsCustomArnCacheWritesPrice defaults to 3.75 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnCacheWritesPrice) {
			setApiConfigurationField("awsCustomArnCacheWritesPrice", 3.75);
		}
	}, [apiConfiguration.awsCustomArnCacheWritesPrice, setApiConfigurationField])

	// Ensure awsCustomArnCacheReadsPrice defaults to 0.3 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnCacheReadsPrice) {
			setApiConfigurationField("awsCustomArnCacheReadsPrice", 0.3);
		}
	}, [apiConfiguration.awsCustomArnCacheReadsPrice, setApiConfigurationField])

	// Ensure awsCustomArnMinTokensPerCachePoint defaults to 1024 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnMinTokensPerCachePoint) {
			setApiConfigurationField("awsCustomArnMinTokensPerCachePoint", 1024);
		}
	}, [apiConfiguration.awsCustomArnMinTokensPerCachePoint, setApiConfigurationField])

	// Ensure awsCustomArnMaxCachePoints defaults to 4 and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnMaxCachePoints) {
			setApiConfigurationField("awsCustomArnMaxCachePoints", 4);
		}
	}, [apiConfiguration.awsCustomArnMaxCachePoints, setApiConfigurationField])

	// Ensure awsCustomArnCachableFields defaults to ["system", "messages", "tools"] and event is fired on mount
	useEffect(() => {
		if (!apiConfiguration?.awsCustomArnCachableFields) {
			setApiConfigurationField("awsCustomArnCachableFields", "system, messages, tools");
		}
	}, [apiConfiguration.awsCustomArnCachableFields, setApiConfigurationField])

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.awsCustomArn || ""}
				onInput={(e) => setApiConfigurationField("awsCustomArn", (e.target as HTMLInputElement).value)}
				placeholder={t("settings:placeholders.customArn")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:labels.customArn")}</label>
			</VSCodeTextField>

			{/* Custom ARN Configuration Fields */}
			
			<div className="flex flex-col space-y-4 mt-4">
				{/* Token Limits */}
				<div className="flex flex-col space-y-2">
					<label className="block font-medium mb-1">
						Input Context Tokens
					</label>
					<div className="flex items-center space-x-2">
						<input
							type="range"
							min={128000}
							max={200000}
							step={1000}
							value={apiConfiguration?.awsCustomArnInputContextTokens || 128000}
							onChange={(e) => setApiConfigurationField("awsCustomArnInputContextTokens", parseInt(e.target.value))}
							className="w-full"
						/>
						<span className="text-sm">
							{(apiConfiguration?.awsCustomArnInputContextTokens || 128000).toLocaleString()}
						</span>
					</div>
				</div>

				<div className="flex flex-col space-y-2">
					<label className="block font-medium mb-1">
						Max Output Tokens
					</label>
					<div className="flex items-center space-x-2">
						<input
							type="range"
							min={8192}
							max={64000}
							step={512}
							value={apiConfiguration?.awsCustomArnMaxOutputTokens || 8192}
							onChange={(e) => setApiConfigurationField("awsCustomArnMaxOutputTokens", parseInt(e.target.value))}
							className="w-full"
						/>
						<span className="text-sm">
							{(apiConfiguration?.awsCustomArnMaxOutputTokens || 8192).toLocaleString()}
						</span>
					</div>
				</div>

				{/* Feature Support Checkboxes */}
				<div className="flex flex-col space-y-2">
					<label className="block font-medium mb-1">
						Model Features
					</label>
					<div className="flex flex-col space-y-2">
						<div className="flex items-center space-x-2">
							<Checkbox 
								checked={apiConfiguration?.awsCustomArnSupportsImages || false}
							onChange={(e) => setApiConfigurationField("awsCustomArnSupportsImages", e)}
							/>
							<span>Supports Images</span>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox 
								checked={apiConfiguration?.awsCustomArnSupportsComputerUse || false}
								onChange={(e) => setApiConfigurationField("awsCustomArnSupportsComputerUse", e)}
							/>
							<span>Supports Computer Use</span>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox 
								checked={apiConfiguration?.awsCustomArnSupportsPromptCaching || false}
								onChange={(e) => setApiConfigurationField("awsCustomArnSupportsPromptCaching", e)}
							/>
							<span>Supports Prompt Caching</span>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox 
								checked={apiConfiguration?.awsCustomArnThinking || false}
								onChange={(e) => setApiConfigurationField("awsCustomArnThinking", e)}
							/>
							<span>Supports Extended Thinking</span>
						</div>
					</div>
				</div>

				{/* Model Costs */}
				<div className="flex flex-col space-y-2 mt-2">
					<label className="block font-medium mb-1">
						Model Costs (defaults for Claude 3.7 Sonnet)
					</label>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnInputPrice?.toString() || "3.00"}
						onChange={(e) => setApiConfigurationField("awsCustomArnInputPrice", parseFloat((e.target as HTMLInputElement).value || "") || 0)}
						placeholder="3.00"
						className="w-full">
						<label className="block font-medium mb-1">Input Price ($/million tokens)</label>
					</VSCodeTextField>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnOutputPrice?.toString() || "15.00"}
						onChange={(e) => setApiConfigurationField("awsCustomArnOutputPrice", parseFloat((e.target as HTMLInputElement).value) || 0)}
						placeholder="15.00"
						className="w-full">
						<label className="block font-medium mb-1">Output Price ($/million tokens)</label>
					</VSCodeTextField>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnCacheWritesPrice?.toString() || "3.75"}
						onChange={(e) => setApiConfigurationField("awsCustomArnCacheWritesPrice", parseFloat((e.target as HTMLInputElement).value) || 0)}
						placeholder="3.75"
						className="w-full">
						<label className="block font-medium mb-1">Cache Writes Price ($/million tokens)</label>
					</VSCodeTextField>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnCacheReadsPrice?.toString() || "0.30"}
						onChange={(e) => setApiConfigurationField("awsCustomArnCacheReadsPrice", parseFloat((e.target as HTMLInputElement).value) || 0)}
						placeholder="0.30"
						className="w-full">
						<label className="block font-medium mb-1">Cache Reads Price ($/million tokens)</label>
					</VSCodeTextField>
				</div>

				{/* Cache Configuration */}
				<div className="flex flex-col space-y-2 mt-2">
					<label className="block font-medium mb-1">
						Cache Configuration
					</label>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnMinTokensPerCachePoint?.toString() || "1024"}
						onChange={(e) => setApiConfigurationField("awsCustomArnMinTokensPerCachePoint", parseInt((e.target as HTMLInputElement).value) || 0)}
						placeholder="1024"
						className="w-full">
						<label className="block font-medium mb-1">Min Tokens Per Cache Point</label>
					</VSCodeTextField>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnMaxCachePoints?.toString() || "4"}
						onChange={(e) => setApiConfigurationField("awsCustomArnMaxCachePoints", parseInt((e.target as HTMLInputElement).value) || 0)}
						placeholder="4"
						className="w-full">
						<label className="block font-medium mb-1">Max Cache Points</label>
					</VSCodeTextField>
					
					<VSCodeTextField
						value={apiConfiguration?.awsCustomArnCachableFields || "system,messages,tools"}
						onChange={(e) => setApiConfigurationField("awsCustomArnCachableFields", (e.target as HTMLInputElement).value)}
						placeholder="system,messages,tools"
						className="w-full">
						<label className="block font-medium mb-1">Cachable Fields (comma-separated)</label>
					</VSCodeTextField>
				</div>
			</div>

			<div hidden={true} className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.awsCustomArnUse")}
				<ul className="list-disc pl-5 mt-1">
					<li>
						arn:aws:bedrock:eu-west-1:123456789012:inference-profile/eu.anthropic.claude-3-7-sonnet-20250219-v1:0
					</li>
					<li>arn:aws:bedrock:us-west-2:123456789012:provisioned-model/my-provisioned-model</li>
					<li>arn:aws:bedrock:us-east-1:123456789012:default-prompt-router/anthropic.claude:1</li>
				</ul>
				{t("settings:providers.awsCustomArnDesc")}
			</div>
			{!validation.isValid ? (
				<div hidden={true} className="text-sm text-vscode-errorForeground mt-2">
					{validation.errorMessage || t("settings:providers.invalidArnFormat")}
				</div>
			) : (
				validation.errorMessage && (
					<div hidden={true} className="text-sm text-vscode-errorForeground mt-2">{validation.errorMessage}</div>
				)
			)}
		</>
	)
}

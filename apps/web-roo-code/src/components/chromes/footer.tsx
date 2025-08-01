"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

import { EXTERNAL_LINKS, INTERNAL_LINKS } from "@/lib/constants"
import { useLogoSrc } from "@/lib/hooks/use-logo-src"
import { ScrollButton } from "@/components/ui"

export function Footer() {
	const [privacyDropdownOpen, setPrivacyDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const logoSrc = useLogoSrc()
	const { resolvedTheme } = useTheme()

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setPrivacyDropdownOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])
	return (
		<footer className="border-t border-border bg-background">
			<div className="mx-auto max-w-7xl px-6 pb-6 pt-12 md:pb-8 md:pt-16 lg:px-8">
				<div className="xl:grid xl:grid-cols-3 xl:gap-8">
					<div className="space-y-8">
						<div className="flex items-center">
							<Image src={logoSrc} alt="Roo Code Logo" width={120} height={40} className="h-6 w-auto" />
						</div>
						<p className="max-w-md text-sm leading-6 text-muted-foreground md:pr-16 lg:pr-32">
							Empowering developers to build better software faster with AI-powered tools and insights.
						</p>

						{/* Made with Roo Code */}
						<a
							href="https://roocode.com"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center space-x-2 group">
							<Image
								src={resolvedTheme === "light" ? "/RooCode-Badge-blk.svg" : "/RooCode-Badge-white.svg"}
								alt="Made with Roo Code"
								width={120}
								height={40}
								className="h-8 w-auto opacity-70 transition-opacity group-hover:opacity-100"
							/>
						</a>
					</div>

					<div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
						<div className="md:grid md:grid-cols-2 md:gap-8">
							<div>
								<h3 className="text-sm font-semibold uppercase leading-6 text-foreground">Product</h3>
								<ul className="mt-6 space-y-4">
									<li>
										<ScrollButton
											targetId="features"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Features
										</ScrollButton>
									</li>
									<li>
										<Link
											href="/enterprise"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Enterprise
										</Link>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.EVALS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Evals
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.SECURITY}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Security
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.INTEGRATIONS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Integrations
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.CHANGELOG}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Changelog
										</a>
									</li>
								</ul>
							</div>
							<div className="mt-10 md:mt-0">
								<h3 className="text-sm font-semibold uppercase leading-6 text-foreground">Resources</h3>
								<ul className="mt-6 space-y-4">
									<li>
										<a
											href={EXTERNAL_LINKS.FAQ}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											FAQ
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.DOCUMENTATION}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Docs
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.TUTORIALS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Tutorials
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.ISSUES}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Issues
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.FEATURE_REQUESTS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Feature Requests
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.OFFICE_HOURS_PODCAST}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Office Hours Podcast
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div className="md:grid md:grid-cols-2 md:gap-8">
							<div>
								<h3 className="text-sm font-semibold uppercase leading-6 text-foreground">Company</h3>
								<ul className="mt-6 space-y-4">
									<li>
										<a
											href="mailto:support@roocode.com"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Contact
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.CAREERS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Careers
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.BLOG}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Blog
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.TESTIMONIALS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Testimonials
										</a>
									</li>
									<li>
										<Link
											href="/terms"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Terms of Service
										</Link>
									</li>
									<li>
										<div className="relative z-10" ref={dropdownRef}>
											<button
												onClick={() => setPrivacyDropdownOpen(!privacyDropdownOpen)}
												className="flex items-center text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
												aria-expanded={privacyDropdownOpen}
												aria-haspopup="true">
												<span>
													Privacy <span className="max-[320px]:hidden">Policy</span>
												</span>
												<ChevronDown
													className={`ml-1 h-4 w-4 transition-transform ${privacyDropdownOpen ? "rotate-180" : ""}`}
												/>
											</button>

											{privacyDropdownOpen && (
												<div className="absolute z-50 mt-2 w-44 origin-top-left scale-95 rounded-md border border-border bg-background shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-100 ease-out data-[state=open]:scale-100 max-xs:right-0 max-xs:origin-top-right xs:left-0">
													<div className="flex flex-col gap-1 p-2 text-sm text-muted-foreground">
														<a
															href={EXTERNAL_LINKS.PRIVACY_POLICY_EXTENSION}
															target="_blank"
															rel="noopener noreferrer"
															onClick={() => setPrivacyDropdownOpen(false)}
															className="rounded-md px-3 py-2 transition-colors hover:bg-accent/50 hover:text-foreground">
															Extension
														</a>
														<Link
															href={INTERNAL_LINKS.PRIVACY_POLICY_WEBSITE}
															onClick={() => setPrivacyDropdownOpen(false)}
															className="rounded-md px-3 py-2 transition-colors hover:bg-accent/50 hover:text-foreground">
															Roo Code Cloud
														</Link>
													</div>
												</div>
											)}
										</div>
									</li>
								</ul>
							</div>
							<div className="mt-10 md:mt-0">
								<h3 className="text-sm font-semibold uppercase leading-6 text-foreground">Connect</h3>
								<ul className="mt-6 space-y-4">
									<li>
										<a
											href={EXTERNAL_LINKS.GITHUB}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											GitHub
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.DISCORD}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Discord
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.REDDIT}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Reddit
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.X}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											X / Twitter
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.LINKEDIN}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											LinkedIn
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.BLUESKY}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											Bluesky
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.TIKTOK}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											TikTok
										</a>
									</li>
									<li>
										<a
											href={EXTERNAL_LINKS.YOUTUBE}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground">
											YouTube
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-16 flex border-t border-border pt-8 sm:mt-20 lg:mt-24">
					<p className="mx-auto text-sm leading-5 text-muted-foreground">
						&copy; {new Date().getFullYear()} Roo Code. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Brain, FileText, Lightbulb, DollarSign, Zap, ChevronRight, Github, Play, Menu, X } from 'lucide-react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold">Luminae</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/auth"
                className="text-sm font-medium hover:text-foreground/80 text-muted-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </nav>
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-foreground hover:bg-muted focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-4 space-y-4 shadow-xl">
              <Link
                href="/auth"
                className="block text-base font-medium text-foreground hover:text-foreground/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-between w-full px-4 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm mb-6 animate-fade-in">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Now with AI-powered grant generation
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight break-words">
                Illuminate Your{' '}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10">Research</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-foreground/10 -z-10" />
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Transform academic papers into actionable intelligence. Luminae uses Mistral AI
                to perform deep critique, identify methodological flaws, propose novel experiments,
                and generate grant proposals—all within a strict budget.
              </p>
              <div className="mt-10 flex justify-center gap-4 flex-wrap">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-foreground text-background rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  Try Demo (Free)
                  <Play className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center px-6 py-3 border border-input text-foreground rounded-lg font-semibold text-lg hover:bg-muted transition-colors"
                >
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">
                Everything You Need to Analyze Research
              </h2>
              <p className="mt-4 text-muted-foreground">
                From paper to proposal in minutes, not weeks
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Smart Ingestion
                </h3>
                <p className="text-muted-foreground">
                  PDF upload with OCR and vision analysis. Extract text, figures, and tables
                  automatically with Mistral's latest models.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Methodology Critique
                </h3>
                <p className="text-muted-foreground">
                  Identify design flaws, statistical issues, and reproducibility concerns
                  with structured severity ratings from expert AI agents.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Experiment Designer
                </h3>
                <p className="text-muted-foreground">
                  Get 3 novel follow-up experiments with hypotheses, methods, and
                  feasibility scores. Never run out of research ideas.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Grant Generator
                </h3>
                <p className="text-muted-foreground">
                  Generate NSF/NIH-style proposal outlines instantly. Specific Aims,
                  Research Strategy, and budget estimates ready to customize.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Budget Protected
                </h3>
                <p className="text-muted-foreground">
                  Complete analysis for under $1. Track costs in real-time with
                  intelligent caching and budget guards.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-colors group">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Multi-Agent AI
                </h3>
                <p className="text-muted-foreground">
                  Parallel execution with 5 specialized agents. OCR → Vision →
                  Critics → Synthesis → Grant in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Built for Researchers, by Researchers
                </h2>
                <p className="text-muted-foreground mb-6">
                  Luminae understands the challenges of academic research. 
                  Our AI-powered platform helps you analyze papers faster, 
                  identify gaps, and generate new research directions.
                </p>
                <ul className="space-y-4">
                  {[
                    "Deep methodology analysis with severity ratings",
                    "Automated dataset auditing and bias detection",
                    "Novel experiment proposals with feasibility scores",
                    "NSF/NIH-style grant outlines in seconds",
                    "Full analysis history for signed-in users",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <ChevronRight className="w-5 h-5 text-foreground flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent rounded-3xl" />
                <div className="relative border border-border rounded-2xl p-6 bg-background">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Analysis Complete</p>
                      <p className="text-muted-foreground">Methodology Score: 85/100</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Critical Issues Found: 2</p>
                      <p className="text-muted-foreground">See details below</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Grant Outline Generated</p>
                      <p className="text-muted-foreground">3 specific aims proposed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Transform Your Research Workflow
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join researchers worldwide who use Luminae to accelerate their literature review,
              identify methodological gaps, and generate new research directions.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center px-8 py-4 bg-background text-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-background" />
              </div>
              <span className="font-bold">Luminae</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Built by <strong>Aletheia Labs</strong> for the <strong>Mistral Worldwide Hackathon 2026</strong> • Powered by Mistral AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

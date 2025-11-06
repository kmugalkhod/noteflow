"use client";

import {
  FileText,
  FolderTree,
  Zap,
  Search,
  Star,
  Paintbrush,
  Lock,
  Cloud,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Write with a powerful editor supporting markdown, formatting, and more.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FolderTree,
    title: "Smart Organization",
    description: "Keep your notes organized with nested folders and intuitive navigation.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with instant search and seamless navigation.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description: "Find anything instantly with our advanced search capabilities.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Star,
    title: "Favorites & Tags",
    description: "Mark important notes and organize with custom tags.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Paintbrush,
    title: "Visual Drawing",
    description: "Create diagrams and sketches with integrated drawing tools.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and secure with enterprise-grade protection.",
    color: "from-slate-500 to-gray-500",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Access your notes from anywhere with automatic cloud synchronization.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Works beautifully on desktop, tablet, and mobile devices.",
    color: "from-teal-500 to-cyan-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Everything you need
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              to stay organized
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you capture, organize, and find your ideas effortlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
            <div className="bg-card rounded-xl px-12 py-16">
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to get started?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who have transformed the way they take notes.
              </p>
              <button className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Start Taking Notes
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

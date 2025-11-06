import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security | NoteFlow",
  description: "Learn how NoteFlow protects your notes and keeps your data secure.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Navigation */}
        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold">Security at NoteFlow</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your notes are private and secure. Here's how we protect them.
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Trust-Based Security Model */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-semibold">Our Security Promise</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                We Do NOT Read Your Notes
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                While we have technical access to the database for operational purposes (like fixing bugs or
                providing support), <strong>we have strict internal policies preventing unauthorized access to your notes</strong>.
              </p>
            </div>

            <p className="text-muted-foreground mb-4">
              NoteFlow uses a <strong>trust-based security model</strong>, similar to apps like Notion, Evernote,
              and Google Docs. This means:
            </p>

            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>Your notes are protected by multiple layers of security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>We commit to never browsing, reading, or using your notes without permission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>Every instance of admin access is logged and traceable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span>You can request your access audit log at any time</span>
              </li>
            </ul>
          </section>

          {/* How We Protect Your Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-semibold">How We Protect Your Data</h2>
            </div>

            <div className="grid gap-6">
              {/* HTTPS Encryption */}
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">🔒 Encrypted Connections</h3>
                <p className="text-muted-foreground">
                  All data sent between your browser and our servers is encrypted using HTTPS/TLS.
                  This means nobody can intercept or read your notes while they're being transmitted.
                </p>
              </div>

              {/* User Isolation */}
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">👤 User Isolation</h3>
                <p className="text-muted-foreground">
                  Your notes are completely separated from other users at the database level. Every query
                  automatically filters by your user ID, making it impossible for one user to access
                  another user's notes.
                </p>
              </div>

              {/* Authentication */}
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">🔑 Secure Authentication</h3>
                <p className="text-muted-foreground">
                  We use Clerk for authentication, which provides industry-standard security with JWT tokens,
                  multi-factor authentication options, and secure session management.
                </p>
              </div>

              {/* Database Security */}
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">🛡️ Row-Level Security</h3>
                <p className="text-muted-foreground">
                  Database queries are automatically filtered to show only your data. Even if someone
                  gained database access, they couldn't see other users' notes without proper authorization.
                </p>
              </div>
            </div>
          </section>

          {/* Audit Logging */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-semibold">Transparency Through Audit Logging</h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We believe in transparency. That's why we've implemented a comprehensive audit logging system:
            </p>

            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-100">
                What Gets Logged
              </h3>
              <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Who</strong>: Which admin accessed the data (name and email)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>When</strong>: Exact timestamp of access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Why</strong>: Reason for access (e.g., "Support ticket #123")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>What</strong>: Which action was performed</span>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>Your Rights</strong>: You can request a copy of your audit log at any time to see
                  if anyone has accessed your data. Contact us at <a href="mailto:privacy@noteflow.com" className="underline">privacy@noteflow.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* When We Access Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-semibold">When We Access User Data</h2>
            </div>

            <p className="text-muted-foreground mb-4">
              We only access user data in these specific circumstances:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <p className="font-semibold">With Your Permission</p>
                  <p className="text-sm text-muted-foreground">
                    When you contact support and request help with a specific issue
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <p className="font-semibold">For Debugging</p>
                  <p className="text-sm text-muted-foreground">
                    When investigating reported bugs that affect your account
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <p className="font-semibold">Legal Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    When required by valid legal process or court order
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <p className="font-semibold">Security Incidents</p>
                  <p className="text-sm text-muted-foreground">
                    To investigate and prevent security breaches
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2">We NEVER:</p>
              <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm">
                <li>❌ Browse user notes out of curiosity</li>
                <li>❌ Sell or share your data with third parties</li>
                <li>❌ Use your notes to train AI models (without explicit consent)</li>
                <li>❌ Access data for marketing purposes</li>
              </ul>
            </div>
          </section>

          {/* Additional Security Measures */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Additional Security Measures</h2>

            <div className="grid md:grid-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="font-semibold mb-2">🔄 Regular Backups</p>
                <p className="text-sm text-muted-foreground">
                  Your data is automatically backed up to prevent loss
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-semibold mb-2">🔍 Security Audits</p>
                <p className="text-sm text-muted-foreground">
                  We regularly review our security practices and update them
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-semibold mb-2">🚨 Incident Response</p>
                <p className="text-sm text-muted-foreground">
                  We have procedures to handle and notify users of security events
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-semibold mb-2">📱 Secure Infrastructure</p>
                <p className="text-sm text-muted-foreground">
                  Hosted on Vercel and Convex with enterprise-grade security
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-border pt-8">
            <h2 className="text-2xl font-semibold mb-4">Questions About Security?</h2>
            <p className="text-muted-foreground mb-4">
              We're happy to answer any security-related questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:security@noteflow.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Email Security Team
              </a>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Read Privacy Policy
              </Link>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border flex gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

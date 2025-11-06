import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | NoteFlow",
  description: "NoteFlow's privacy policy explaining how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: November 4, 2025</p>
        </header>

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section>
            <h2>Introduction</h2>
            <p>
              Welcome to NoteFlow. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, and safeguard your information when you use
              our note-taking application.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>

            <h3>Data You Provide</h3>
            <ul>
              <li><strong>Email Address</strong>: Used for account creation and authentication</li>
              <li><strong>Name</strong>: Optional display name for your profile</li>
              <li><strong>Profile Picture</strong>: Optional image from your authentication provider</li>
              <li><strong>Notes and Content</strong>: All notes, drawings, folders, and tags you create</li>
            </ul>

            <h3>Automatically Collected Data</h3>
            <ul>
              <li><strong>Usage Analytics</strong>: How you interact with the app (optional, anonymized)</li>
              <li><strong>Technical Data</strong>: Browser type, IP address, device information</li>
              <li><strong>Authentication Tokens</strong>: Secure tokens for maintaining your logged-in session</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <p>We use your data exclusively to:</p>
            <ol>
              <li><strong>Provide the Service</strong>: Store and sync your notes across devices</li>
              <li><strong>Authenticate You</strong>: Verify your identity and maintain secure sessions</li>
              <li><strong>Improve the Product</strong>: Understand usage patterns to enhance features</li>
              <li><strong>Provide Support</strong>: Help resolve technical issues when you request assistance</li>
              <li><strong>Send Important Updates</strong>: Notify you of service changes or security issues</li>
            </ol>
          </section>

          <section>
            <h2>Data Security & Admin Access</h2>

            <h3>Our Security Model</h3>
            <p>NoteFlow uses <strong>industry-standard security practices</strong>:</p>
            <ul>
              <li><strong>Encryption in Transit</strong>: All data transmitted over HTTPS</li>
              <li><strong>User Isolation</strong>: Your notes are separated from other users at the database level</li>
              <li><strong>Row-Level Security</strong>: Database queries automatically filter by your user ID</li>
              <li><strong>Secure Authentication</strong>: Powered by Clerk with JWT tokens</li>
            </ul>

            <h3>Admin Access Policy</h3>
            <p className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <strong>Important</strong>: While we have technical access to your data for operational purposes,
              <strong> we do NOT read your notes</strong>.
            </p>

            <p>We may access user data only in these specific circumstances:</p>
            <ol>
              <li><strong>With Your Permission</strong>: When you contact support and request help</li>
              <li><strong>For Debugging</strong>: When investigating reported bugs affecting your account</li>
              <li><strong>Legal Requirements</strong>: When required by valid legal process or court order</li>
              <li><strong>Security Incidents</strong>: To investigate and prevent security breaches</li>
            </ol>

            <h3>Access Logging & Transparency</h3>
            <p>Every instance of admin access to user data is:</p>
            <ul>
              <li>✅ <strong>Logged automatically</strong> in our audit system</li>
              <li>✅ <strong>Includes</strong>: Admin name, timestamp, reason, and action performed</li>
              <li>✅ <strong>Reviewable</strong>: You can request your audit log at any time</li>
              <li>✅ <strong>Restricted</strong>: Only authorized personnel can access user data</li>
            </ul>

            <p><strong>We commit to NEVER</strong>:</p>
            <ul>
              <li>❌ Browse user notes out of curiosity</li>
              <li>❌ Sell or share your data with third parties</li>
              <li>❌ Use your notes to train AI models (without explicit consent)</li>
              <li>❌ Access data for marketing purposes</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>NoteFlow relies on trusted third-party providers:</p>

            <h3>Clerk (Authentication)</h3>
            <ul>
              <li><strong>Purpose</strong>: Secure user authentication and account management</li>
              <li><strong>Data Shared</strong>: Email, name, profile picture</li>
              <li><strong>Privacy Policy</strong>: <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a></li>
            </ul>

            <h3>Convex (Database)</h3>
            <ul>
              <li><strong>Purpose</strong>: Store and sync your notes and data</li>
              <li><strong>Data Shared</strong>: All app data (notes, folders, etc.)</li>
              <li><strong>Privacy Policy</strong>: <a href="https://convex.dev/privacy" target="_blank" rel="noopener noreferrer">convex.dev/privacy</a></li>
              <li><strong>Security</strong>: Data encrypted at rest and in transit</li>
            </ul>

            <h3>Vercel (Hosting)</h3>
            <ul>
              <li><strong>Purpose</strong>: Host and serve the application</li>
              <li><strong>Data Shared</strong>: Technical logs, IP addresses</li>
              <li><strong>Privacy Policy</strong>: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
            </ul>
          </section>

          <section>
            <h2>Your Rights (GDPR Compliance)</h2>
            <p>You have the right to:</p>

            <h3>Access Your Data</h3>
            <ul>
              <li>Download all your notes and content at any time</li>
              <li>Request a copy of all data we hold about you</li>
              <li>View audit logs of admin access to your account</li>
            </ul>

            <h3>Delete Your Data</h3>
            <ul>
              <li>Delete individual notes, folders, or tags</li>
              <li>Permanently delete your entire account</li>
              <li><strong>Note</strong>: Deletion is permanent and cannot be undone</li>
            </ul>

            <h3>Export Your Data</h3>
            <ul>
              <li>Export notes in standard formats (JSON, Markdown)</li>
              <li>Take your data to another service</li>
              <li>No lock-in or proprietary formats</li>
            </ul>

            <p>To exercise any of these rights, contact us at: <strong>privacy@noteflow.com</strong></p>
          </section>

          <section>
            <h2>Data Retention</h2>
            <ul>
              <li><strong>Active Accounts</strong>: Data stored as long as your account is active</li>
              <li><strong>Deleted Notes</strong>: Moved to trash for 30 days, then permanently deleted</li>
              <li><strong>Closed Accounts</strong>: All data permanently deleted within 30 days</li>
              <li><strong>Audit Logs</strong>: Retained for 1 year for security and compliance</li>
            </ul>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>For privacy-related questions, concerns, or requests:</p>
            <ul>
              <li><strong>Email</strong>: privacy@noteflow.com</li>
              <li><strong>GitHub Issues</strong>: <a href="https://github.com/kmugalkhod/noteflow/issues" target="_blank" rel="noopener noreferrer">github.com/kmugalkhod/noteflow/issues</a></li>
              <li><strong>Response Time</strong>: We aim to respond within 48 hours</li>
            </ul>
          </section>

          <section>
            <h2>Security Measures</h2>
            <p>We implement multiple layers of security:</p>
            <ol>
              <li><strong>Network Security</strong>: HTTPS/TLS encryption for all connections</li>
              <li><strong>Database Security</strong>: Row-level security and user isolation</li>
              <li><strong>Access Controls</strong>: Role-based permissions and audit logging</li>
              <li><strong>Regular Audits</strong>: Periodic security reviews and updates</li>
              <li><strong>Incident Response</strong>: Procedures for handling security events</li>
            </ol>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>We may update this privacy policy periodically. Changes will be:</p>
            <ul>
              <li><strong>Posted on this page</strong> with an updated "Last Updated" date</li>
              <li><strong>Notified via email</strong> for significant changes</li>
              <li><strong>Effective immediately</strong> unless stated otherwise</li>
            </ul>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date</strong>: November 4, 2025
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This privacy policy is part of our commitment to protecting your privacy while providing
              a great note-taking experience. Thank you for trusting NoteFlow with your notes.
            </p>
          </section>
        </article>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border flex gap-6">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">
            Security
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | NoteFlow",
  description: "NoteFlow's terms of service governing the use of our note-taking application.",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: November 4, 2025</p>
        </header>

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section>
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using NoteFlow ("the Service"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2>Description of Service</h2>
            <p>NoteFlow is a note-taking application that allows users to:</p>
            <ul>
              <li>Create, edit, and organize notes</li>
              <li>Create drawings and whiteboards</li>
              <li>Organize notes in folders</li>
              <li>Tag and search notes</li>
              <li>Share notes publicly (optional)</li>
              <li>Sync notes across devices</li>
            </ul>
          </section>

          <section>
            <h2>Account Registration</h2>

            <h3>Creating an Account</h3>
            <ul>
              <li>You must provide accurate and complete information</li>
              <li>You must be at least 13 years of age</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h3>Account Security</h3>
            <ul>
              <li>Keep your password confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>We are not liable for losses due to unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2>User Content and Ownership</h2>

            <h3>Your Content</h3>
            <ul>
              <li><strong>You retain full ownership</strong> of all notes, drawings, and content you create</li>
              <li>We do not claim any ownership rights to your content</li>
              <li>You are solely responsible for your content and its legality</li>
            </ul>

            <h3>License to Us</h3>
            <p>By using NoteFlow, you grant us a limited license to:</p>
            <ul>
              <li>Store and display your content as necessary to provide the Service</li>
              <li>Backup your content for disaster recovery</li>
              <li>Process your content to enable features (search, sharing, etc.)</li>
            </ul>
            <p>This license ends when you delete your content or close your account.</p>

            <h3>Content Restrictions</h3>
            <p>You agree NOT to upload, post, or share content that:</p>
            <ul>
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Is fraudulent, defamatory, or misleading</li>
              <li>Harasses, threatens, or harms others</li>
              <li>Contains excessive violence or illegal material</li>
            </ul>
          </section>

          <section>
            <h2>Acceptable Use Policy</h2>

            <h3>Permitted Uses</h3>
            <ul>
              <li>Personal note-taking and organization</li>
              <li>Collaboration with others (when available)</li>
              <li>Educational and professional purposes</li>
              <li>Lawful content storage</li>
            </ul>

            <h3>Prohibited Uses</h3>
            <p>You may NOT:</p>
            <ul>
              <li>Use the Service for illegal activities</li>
              <li>Attempt to hack, breach, or compromise security</li>
              <li>Reverse engineer or decompile the Service</li>
              <li>Scrape, copy, or redistribute Service content without permission</li>
              <li>Use the Service to spam or distribute malware</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Overload or interfere with Service infrastructure</li>
              <li>Violate others' privacy or intellectual property</li>
            </ul>
          </section>

          <section>
            <h2>Service Availability and Limitations</h2>

            <h3>As-Is Service</h3>
            <p className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              NoteFlow is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
            </p>

            <ul>
              <li>No guarantee of uninterrupted availability</li>
              <li>No guarantee of error-free operation</li>
              <li>No guarantee of data permanence</li>
            </ul>

            <h3>Service Changes</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Modify or discontinue features</li>
              <li>Update these Terms</li>
              <li>Change pricing (for paid features)</li>
              <li>Suspend or terminate the Service</li>
            </ul>
            <p>We will provide reasonable notice for significant changes.</p>
          </section>

          <section>
            <h2>Data and Privacy</h2>

            <h3>Data Processing</h3>
            <ul>
              <li>We process your data as described in our <Link href="/privacy">Privacy Policy</Link></li>
              <li>You consent to data processing necessary for the Service</li>
              <li>We implement reasonable security measures</li>
            </ul>

            <h3>Data Backup</h3>
            <ul>
              <li>You are responsible for backing up your data</li>
              <li>We provide export functionality for this purpose</li>
              <li>We are not liable for data loss</li>
            </ul>
          </section>

          <section>
            <h2>Intellectual Property</h2>

            <h3>Our Rights</h3>
            <p>
              NoteFlow, including its design, code, features, and branding, is our property and protected by
              copyright, trademark, and other intellectual property laws.
            </p>

            <h3>Your Rights</h3>
            <ul>
              <li>You may use the Service as intended</li>
              <li>You may not copy, modify, or distribute our software</li>
              <li>You may not use our trademarks without permission</li>
            </ul>
          </section>

          <section>
            <h2>Liability and Disclaimers</h2>

            <h3>Limitation of Liability</h3>
            <p className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <ul>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid us (if any) in the past 12 months</li>
              <li>We are not liable for data loss, business interruption, or lost profits</li>
            </ul>

            <h3>Disclaimer of Warranties</h3>
            <ul>
              <li>THE SERVICE IS PROVIDED "AS IS"</li>
              <li>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED</li>
              <li>WE DO NOT WARRANT ACCURACY, RELIABILITY, OR AVAILABILITY</li>
            </ul>
          </section>

          <section>
            <h2>Termination</h2>

            <h3>By You</h3>
            <ul>
              <li>You may close your account at any time</li>
              <li>Export your data before closing</li>
              <li>Deletion is permanent after 30 days</li>
            </ul>

            <h3>By Us</h3>
            <p>We may suspend or terminate your account if:</p>
            <ul>
              <li>You violate these Terms</li>
              <li>You engage in fraudulent activity</li>
              <li>Required by law or legal process</li>
              <li>We discontinue the Service</li>
            </ul>
          </section>

          <section>
            <h2>Payment and Refunds</h2>

            <h3>Free Service</h3>
            <ul>
              <li>NoteFlow is currently free to use</li>
              <li>We reserve the right to introduce paid features</li>
            </ul>

            <h3>Future Paid Features</h3>
            <p>If we introduce paid features:</p>
            <ul>
              <li>Pricing will be clearly displayed</li>
              <li>You must agree before being charged</li>
              <li>Refund policy will be specified</li>
            </ul>
          </section>

          <section>
            <h2>Changes to Terms</h2>
            <p>We may update these Terms by:</p>
            <ul>
              <li>Posting the new Terms on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Notifying users of material changes via email</li>
            </ul>
            <p>Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>For questions about these Terms:</p>
            <ul>
              <li><strong>Email</strong>: legal@noteflow.com</li>
              <li><strong>GitHub</strong>: <a href="https://github.com/kmugalkhod/noteflow" target="_blank" rel="noopener noreferrer">github.com/kmugalkhod/noteflow</a></li>
            </ul>
          </section>

          <section>
            <h2>Acknowledgment</h2>
            <p>By using NoteFlow, you acknowledge that:</p>
            <ul>
              <li>You have read and understood these Terms</li>
              <li>You agree to be bound by these Terms</li>
              <li>You are authorized to agree to these Terms</li>
            </ul>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date</strong>: November 4, 2025
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Thank you for using NoteFlow responsibly.
            </p>
          </section>
        </article>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border flex gap-6">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">
            Security
          </Link>
        </div>
      </div>
    </div>
  );
}

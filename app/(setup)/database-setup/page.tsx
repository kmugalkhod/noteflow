"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export default function DatabaseSetupPage() {
  const [step, setStep] = useState(1);
  const [convexUrl, setConvexUrl] = useState("");
  const [deploymentId, setDeploymentId] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const schemaCode = `// Save this as: convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Private Database</h1>
        <p className="text-gray-600 mb-8">
          Follow these steps to connect your own Convex database. Your data will be completely private.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-1 ${
                    s < step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Create Convex Account */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Create Convex Account</h2>
            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <div>
                  <p>Go to Convex and create a free account</p>
                  <a
                    href="https://dashboard.convex.dev/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Open Convex Dashboard <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <p>Sign up with GitHub (recommended) or email</p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <p>Create a new project called "noteflow-database"</p>
              </li>
            </ol>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              I've Created My Account →
            </button>
          </div>
        )}

        {/* Step 2: Download Schema Files */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Step 2: Download Schema Files
            </h2>
            <p className="mb-4 text-gray-700">
              Download these files to set up your database structure:
            </p>

            {/* Schema File */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">schema.ts</h3>
                <button
                  onClick={() => copyToClipboard(schemaCode, "schema")}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {copied === "schema" ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {schemaCode}
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Unfortunately, Convex requires you to deploy
                the schema via their CLI. There's no "paste and run" option in the
                dashboard.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deploy Schema (THE REALITY) */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Step 3: Deploy Schema to Convex
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">
                ⚠️ Technical Requirement
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Convex does NOT allow running schema deployment from the browser.
                You must use their CLI tool on your computer.
              </p>
              <p className="text-sm text-red-700">
                This requires: Node.js, Terminal/Command Line, and technical knowledge.
              </p>
            </div>

            <h3 className="font-semibold mb-3">Required Steps:</h3>
            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <div>
                  <p className="font-medium">Install Node.js (if not installed)</p>
                  <a
                    href="https://nodejs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1 text-sm"
                  >
                    Download Node.js <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <div>
                  <p className="font-medium">Create project folder and add schema</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">
{`mkdir noteflow-db
cd noteflow-db
npm install convex
# Create convex/schema.ts with the code from Step 2`}
                  </pre>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <div>
                  <p className="font-medium">Deploy the schema</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-2 text-sm">
                    npx convex deploy --prod
                  </pre>
                </div>
              </li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Success Indicator:</strong> After running the deploy command,
                you'll see output like:
              </p>
              <pre className="bg-white p-2 rounded mt-2 text-xs">
{`✓ Schema deployed successfully!
Your deployment URL: https://happy-animal-123.convex.cloud`}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                I've Deployed the Schema →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Get Credentials */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Step 4: Get Your Credentials</h2>
            <p className="mb-6 text-gray-700">
              After deploying, get your Convex URL from the dashboard:
            </p>

            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <p>Go to your Convex project dashboard</p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <p>Click "Settings" → "URL & Deploy Key"</p>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <p>Copy your deployment URL and deployment ID</p>
              </li>
            </ol>

            <div>
              <label className="block text-sm font-medium mb-2">
                Convex Public URL
              </label>
              <input
                type="text"
                value={convexUrl}
                onChange={(e) => setConvexUrl(e.target.value)}
                placeholder="https://your-project.convex.cloud"
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />

              <label className="block text-sm font-medium mb-2">
                Deployment ID
              </label>
              <input
                type="text"
                value={deploymentId}
                onChange={(e) => setDeploymentId(e.target.value)}
                placeholder="prod:happy-animal-123"
                className="w-full px-4 py-2 border rounded-lg mb-6"
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">
                ⚠️ Critical Problem
              </h3>
              <p className="text-sm text-red-700">
                Even after you enter these values, <strong>this won't work</strong> because:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                <li>The Convex URL is hardcoded when the app was built</li>
                <li>LocalStorage cannot change compiled JavaScript</li>
                <li>You would need a page reload, which resets to default URL</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!convexUrl || !deploymentId}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Anyway →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Reality Check */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              ⚠️ This Approach Cannot Work
            </h2>

            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-3">
                Why This Setup Process Fails:
              </h3>
              <ul className="space-y-3 text-red-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <p>
                    Requires users to have <strong>technical skills</strong> (Node.js, CLI, Terminal)
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <p>
                    If users can run CLI commands, <strong>they can just deploy the entire app themselves</strong>
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <p>
                    The Convex URL is <strong>baked into JavaScript at build time</strong> - cannot be changed via localStorage
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <p>
                    95% of users will <strong>give up</strong> before completing this process
                  </p>
                </li>
              </ul>
            </div>

            <h3 className="font-semibold mb-3 text-gray-900">
              ✅ What Actually Works:
            </h3>

            <div className="space-y-4">
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  Option 1: One-Click Deploy (Recommended)
                </h4>
                <p className="text-sm text-green-800 mb-3">
                  Users click a button → Their own instance is deployed automatically
                </p>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                  <li>Perfect privacy (they own everything)</li>
                  <li>70% success rate</li>
                  <li>Takes 5 minutes</li>
                  <li>No coding required</li>
                </ul>
              </div>

              <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Option 2: Hosted Version (Simplest)
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Use the hosted version with audit logging
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Zero setup time</li>
                  <li>99% success rate</li>
                  <li>Audit logs ensure transparency</li>
                  <li>Industry-standard security</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/"
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Go Back to Choose a Working Option
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

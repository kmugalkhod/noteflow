export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-lavender-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">noteflow</h1>
          <p className="text-gray-600">Your new home for writing</p>
        </div>
        {children}
      </div>
    </div>
  );
}

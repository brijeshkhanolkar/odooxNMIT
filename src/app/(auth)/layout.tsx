export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Dayflow</h1>
          </div>
          <p className="text-sm text-slate-500">Every workday, perfectly aligned.</p>
        </div>
        {children}
      </div>
    </div>
  );
}

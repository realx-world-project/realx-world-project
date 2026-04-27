export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Relex World</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
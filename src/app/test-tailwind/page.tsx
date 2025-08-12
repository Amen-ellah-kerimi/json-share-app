export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-700 mb-6">
          If you can see this styled properly, Tailwind CSS v4.x is working!
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="w-full bg-gray-200 text-gray-900 py-2 px-4 rounded hover:bg-gray-300 transition-colors">
            Secondary Button
          </button>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 bg-red-500 rounded"></div>
            <div className="h-8 bg-green-500 rounded"></div>
            <div className="h-8 bg-blue-500 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

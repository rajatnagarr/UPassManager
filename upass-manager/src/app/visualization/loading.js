export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#861F41] mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Loading detailed visualization...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
}

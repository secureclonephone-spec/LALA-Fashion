export default function ApprovePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Approve Reviews</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and approve customer ratings, comments, or submissions.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    There are no pending items that require your approval right now.
                </p>
            </div>
        </div>
    );
}

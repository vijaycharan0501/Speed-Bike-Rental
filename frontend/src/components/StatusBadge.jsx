const STYLE_MAP = {
  // Booking statuses
  Pending: 'bg-amber-100 text-amber-900 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-900 border-blue-200',
  Active: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  Completed: 'bg-green-100 text-green-900 border-green-200',
  Cancelled: 'bg-red-100 text-red-900 border-red-200',

  // Payment statuses
  Paid: 'bg-green-100 text-green-900 border-green-200',
  Unpaid: 'bg-gray-100 text-gray-800 border-gray-200',
  Partial: 'bg-amber-100 text-amber-900 border-amber-200',
  Refunded: 'bg-purple-100 text-purple-900 border-purple-200',

  // Bike availability
  available: 'bg-green-100 text-green-900 border-green-200',
  unavailable: 'bg-red-100 text-red-900 border-red-200',
  maintenance: 'bg-amber-100 text-amber-900 border-amber-200',

  // Reviews & Enquiries
  approved: 'bg-green-100 text-green-900 border-green-200',
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  hidden: 'bg-gray-200 text-gray-700 border-gray-300',
  new: 'bg-amber-100 text-amber-900 border-amber-200',
  read: 'bg-blue-100 text-blue-900 border-blue-200',
  replied: 'bg-green-100 text-green-900 border-green-200',
  archived: 'bg-gray-200 text-gray-700 border-gray-300',
};

export function StatusBadge({ status, label }) {
  const classes = STYLE_MAP[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${classes}`}
    >
      {label || status}
    </span>
  );
}

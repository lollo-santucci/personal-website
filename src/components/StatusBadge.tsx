export type Status =
  | 'completed'
  | 'in-progress'
  | 'ongoing'
  | 'active'
  | 'coming-soon'
  | 'experimental';

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-800',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-blue-100 text-blue-800',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800',
  },
  'coming-soon': {
    label: 'Coming Soon',
    className: 'bg-purple-100 text-purple-800',
  },
  experimental: {
    label: 'Experimental',
    className: 'bg-orange-100 text-orange-800',
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

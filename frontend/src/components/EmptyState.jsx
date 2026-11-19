export function EmptyState({ icon: Icon, title, description, action = null }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-grey text-brand-black">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-bold text-brand-black">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-brand-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

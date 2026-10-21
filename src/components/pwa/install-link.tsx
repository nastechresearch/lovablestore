"use client";

export function InstallLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("lovable:install"))}
      className={className}
    >
      {children}
    </button>
  );
}

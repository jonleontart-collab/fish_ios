import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
  titleClassName = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-text-muted">
            {eyebrow}
          </div>
        ) : null}
        <div className={`mt-1 text-[22px] font-semibold tracking-tight text-text-main ${titleClassName}`.trim()}>
          {title}
        </div>
        {description ? (
          <div className="mt-1 max-w-[26rem] text-sm leading-6 text-text-muted">{description}</div>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

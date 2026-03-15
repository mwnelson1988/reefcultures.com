import * as React from "react";

export function Section(props: React.PropsWithChildren<{ className?: string; id?: string }>) {
  const { children, className = "", id } = props;
  return (
    <section id={id} className={`rc-section ${className}`}>
      <div className="rc-container">{children}</div>
    </section>
  );
}

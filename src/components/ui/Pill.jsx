import { cn } from '@/utils/cn';

export default function Pill({ kind = 'gray', children, className, small }) {
  return (
    <span
      className={cn('op-pill', `op-pill-${kind}`, className)}
      style={small ? { fontSize: '9.5px', padding: '1px 6px' } : undefined}
    >
      {children}
    </span>
  );
}

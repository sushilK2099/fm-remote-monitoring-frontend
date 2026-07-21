import { useEffect, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { locationService } from '@/api/services/location.service';

/**
 * Given a locationId, fetches the full ancestor chain and renders:
 *   📍 Site A  >  Building 2  >  Floor 1
 */
export default function LocationPath({ locationId, className }) {
  const [path, setPath] = useState(null); // null = loading, [] = not found

  useEffect(() => {
    if (!locationId) { setPath([]); return; }

    let cancelled = false;

    async function buildPath() {
      const chain = [];
      let currentId = locationId;

      while (currentId) {
        try {
          const res = await locationService.getById(currentId);
          const loc = res.data.data || res.data;
          if (!loc || cancelled) break;
          chain.unshift(loc.locationName);
          currentId = loc.parentId || null;
        } catch {
          break;
        }
      }

      if (!cancelled) setPath(chain);
    }

    setPath(null);
    buildPath();

    return () => { cancelled = true; };
  }, [locationId]);

  if (!locationId) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;

  if (path === null) {
    return (
      <span className="inline-flex items-center gap-1 text-sm animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
        Loading…
      </span>
    );
  }

  if (path.length === 0) {
    return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 flex-wrap text-sm ${className ?? ''}`}>
      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
      {path.map((name, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
          <span style={{ color: i === path.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {name}
          </span>
        </span>
      ))}
    </span>
  );
}

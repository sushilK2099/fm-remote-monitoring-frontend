'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import { dashboardService } from '@/api/services/dashboard.service';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Panel from './Panel';
import PanelConfigDrawer from './PanelConfigDrawer';
import useDashboardLabels from './useDashboardLabels';
import useTargetLabels from '@/hooks/useTargetLabels';

const COLS = 12;
const ROW_HEIGHT = 40;

// Starter dashboard shown when the account has no saved dashboard yet — built DYNAMICALLY
// from the account's actual metrics (metric IDs vary per install, so they can't be
// hardcoded). In-memory only; persists only when the user clicks Save.
//
// Layout: a row of "current value" stat tiles (latest reading per metric), then one
// multi-line "all metrics — 24h" overview, then a 7d trend per metric (first few).
function buildDefaultPanels(metrics, metricLabel) {
  const list = (metrics || []).filter((m) => m.status !== 'INACTIVE');
  if (!list.length) return [];

  const panels = [];
  const STAT_W = 3;                       // 4 stat tiles per 12-col row
  // Target-qualified title so same-named metrics are distinguishable
  // ("Temperature — Demo Chiller" vs "Temperature — building 1").
  const label = (m) => (metricLabel && metricLabel(m)) || (m.unit ? `${m.name} (${m.unit})` : m.name);

  // 1. Current-value stat tiles (latest per metric), capped at 4 so the top row stays tidy.
  list.slice(0, 4).forEach((m, i) => {
    panels.push({
      title: label(m), viz: 'stat', range: '24h',
      query: {
        entity: 'readings',
        dimensions: [{ field: 'recordedAt', transform: 'hour' }],
        measures: [{ field: 'value', agg: 'last' }],
        filters: [{ field: 'metricId', op: 'in', value: [m.metricId] }],
      },
      layout: { x: (i % 4) * STAT_W, y: 0, w: STAT_W, h: 5 },
    });
  });

  // 2. Multi-line overview — all metrics on one chart (Time × Metric), last 24h.
  panels.push({
    title: 'All metrics — last 24h', viz: 'line', range: '24h',
    query: {
      entity: 'readings',
      dimensions: [{ field: 'recordedAt', transform: 'hour' }, { field: 'metricId' }],
      measures: [{ field: 'value', agg: 'avg' }],
      filters: [{ field: 'metricId', op: 'in', value: list.map((m) => m.metricId) }],
    },
    layout: { x: 0, y: 5, w: 12, h: 9 },
  });

  // 3. Per-metric 7d trend (first 4 metrics), two per row.
  list.slice(0, 4).forEach((m, i) => {
    panels.push({
      title: `${label(m)} — 7d`, viz: 'area', range: '7d',
      query: {
        entity: 'readings',
        dimensions: [{ field: 'recordedAt', transform: 'hour' }],
        measures: [{ field: 'value', agg: 'avg' }],
        filters: [{ field: 'metricId', op: 'in', value: [m.metricId] }],
      },
      layout: { x: (i % 2) * 6, y: 14 + Math.floor(i / 2) * 8, w: 6, h: 8 },
    });
  });

  return panels;
}

// Measure the real rendered width of a container. Uses a CALLBACK ref so measurement
// happens the instant the node attaches (the container mounts only after loading ends,
// so a plain useEffect+useRef raced and read 0). A ResizeObserver tracks later changes.
// (The library's own useContainerWidth reported a stale 1280px on this layout.)
function useMeasuredWidth() {
  const [width, setWidth] = useState(0);
  const roRef = useRef(null);

  const ref = useCallback((node) => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure(); // immediate read on attach
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    roRef.current = ro;
  }, []);

  return { ref, width };
}
const DEFAULT_PANEL = { w: 4, h: 7 }; // ~280px tall at 40px rows + margins

// Give every panel a stable string id used as the grid item key.
function panelId(panel, i) {
  return panel._id || `panel-${i}`;
}

// Derive an RGL layout array from the panels. Panels without a saved layout are
// auto-placed left-to-right, wrapping at COLS.
function layoutFromPanels(panels) {
  let cursorX = 0;
  let cursorY = 0;
  return panels.map((p, i) => {
    const l = p.layout || {};
    const w = Number.isFinite(l.w) ? l.w : DEFAULT_PANEL.w;
    const h = Number.isFinite(l.h) ? l.h : DEFAULT_PANEL.h;
    let x = Number.isFinite(l.x) ? l.x : null;
    let y = Number.isFinite(l.y) ? l.y : null;
    if (x == null || y == null) {
      if (cursorX + w > COLS) { cursorX = 0; cursorY += DEFAULT_PANEL.h; }
      x = cursorX; y = cursorY; cursorX += w;
    }
    return { i: panelId(p, i), x, y, w, h, minW: 2, minH: 4 };
  });
}

export default function DashboardsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [panels, setPanels] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Measure the grid container width directly (library's useContainerWidth mis-reported it).
  const { ref: containerRef, width: measuredWidth } = useMeasuredWidth();
  // Never block rendering on measurement: fall back to a reasonable width until the
  // ResizeObserver reports the real one (avoids the panels-disappear-at-width-0 case).
  const width = measuredWidth > 0 ? measuredWidth : 1200;
  const mounted = true; // container always renders; width self-corrects via ResizeObserver

  // Resolve raw dimension IDs (locationId/assignedTo) to names, fetched once for all panels.
  const { resolveLabel, metrics } = useDashboardLabels();
  const { metricLabel } = useTargetLabels();

  const [hasSaved, setHasSaved] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getDashboards();
      const list = res.data?.data || [];
      const existing = list[0] || null;
      const savedPanels = existing?.panels || [];
      setDashboard(existing);

      if (savedPanels.length) {
        setPanels(savedPanels.map((p, i) => ({ ...p, _id: `panel-${i}` })));
        setHasSaved(true);
      } else {
        // No saved panels — defaults get seeded (below) once metrics load. In-memory only;
        // persists when the user clicks Save.
        setHasSaved(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Seed dynamic default panels from the account's real metrics — once, when there's no
  // saved dashboard and metrics have loaded.
  useEffect(() => {
    if (hasSaved || seeded || !metrics?.length) return;
    const defaults = buildDefaultPanels(metrics, metricLabel);
    if (defaults.length) {
      setPanels(defaults.map((p, i) => ({ ...p, _id: `default-${i}` })));
      setSeeded(true);
    }
  }, [hasSaved, seeded, metrics, metricLabel]);

  const layout = useMemo(() => layoutFromPanels(panels), [panels]);

  const openAdd = () => { setEditIndex(null); setDrawerOpen(true); };
  const openEdit = (i) => { setEditIndex(i); setDrawerOpen(true); };

  const handleSavePanel = (panel) => {
    setPanels((prev) => {
      if (editIndex == null) {
        return [...prev, { ...panel, _id: `panel-${Date.now()}` }];
      }
      const next = [...prev];
      const existing = next[editIndex];
      // Preserve the panel's existing grid position/size — the drawer returns layout:{},
      // which would otherwise clobber {x,y,w,h} and make the panel jump on edit.
      next[editIndex] = {
        ...existing,
        ...panel,
        layout: existing.layout && Object.keys(existing.layout).length ? existing.layout : panel.layout,
      };
      return next;
    });
    setDrawerOpen(false);
  };

  const handleDeletePanel = (i) => {
    setPanels((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleBarMode = (i, mode) => {
    setPanels((prev) => prev.map((p, idx) => (idx === i ? { ...p, barMode: mode } : p)));
  };

  // RGL hands back the current layout on any drag/resize. Merge {x,y,w,h} back into
  // each panel by its grid id so Save persists the arrangement.
  const onLayoutChange = useCallback((next) => {
    setPanels((prev) => {
      const byId = Object.fromEntries(next.map((l) => [l.i, l]));
      let changed = false;
      const merged = prev.map((p, i) => {
        const l = byId[panelId(p, i)];
        if (!l) return p;
        const layout = { x: l.x, y: l.y, w: l.w, h: l.h };
        const cur = p.layout || {};
        if (cur.x === layout.x && cur.y === layout.y && cur.w === layout.w && cur.h === layout.h) return p;
        changed = true;
        return { ...p, layout };
      });
      return changed ? merged : prev;
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Strip client-only _id before persisting.
      const payload = panels.map(({ _id, ...rest }) => rest);
      if (dashboard) {
        const res = await dashboardService.updateDashboard(dashboard.dashboardId, { panels: payload });
        setDashboard(res.data?.data || dashboard);
      } else {
        const res = await dashboardService.createDashboard({ name: 'My Dashboard', panels: payload });
        setDashboard(res.data?.data || null);
      }
      toast.success('Dashboard saved');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Dashboards"
      description="Build custom views of your sensor readings."
      actions={
        <>
          <Button variant="outline" leftIcon={<Plus size={16} />} onClick={openAdd}>Add panel</Button>
          <Button leftIcon={<Save size={16} />} isLoading={saving} onClick={save}>Save</Button>
        </>
      }
    >
      {loading ? (
        <Loader />
      ) : !panels.length ? (
        <EmptyState
          title="No panels yet"
          description="Add your first panel to start visualizing sensor readings."
          actionLabel="Add panel"
          onAction={openAdd}
        />
      ) : (
        <div ref={containerRef} style={{ width: '100%' }}>
          {mounted && (
            <ResponsiveGridLayout
              className="layout"
              width={width}
              layouts={{ lg: layout, md: layout, sm: layout }}
              breakpoints={{ lg: 1200, md: 900, sm: 0 }}
              cols={{ lg: COLS, md: COLS, sm: 1 }}
              rowHeight={ROW_HEIGHT}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              draggableHandle=".panel-drag-handle"
              onLayoutChange={onLayoutChange}
            >
              {panels.map((panel, i) => (
                // RGL owns this div's positioning transform — keep it plain. Animate the
                // inner wrapper only (mount fade+scale, staggered), never the grid geometry.
                <div key={panelId(panel, i)}>
                  <motion.div
                    className="h-full"
                    initial={{ opacity: 0, scale: 0.97, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.04, 0.24) }}
                  >
                    <Panel
                      panel={panel}
                      onEdit={() => openEdit(i)}
                      onDelete={() => handleDeletePanel(i)}
                      onBarModeChange={(mode) => handleBarMode(i, mode)}
                      resolveLabel={resolveLabel}
                    />
                  </motion.div>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>
      )}

      <PanelConfigDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSavePanel}
        initialPanel={editIndex != null ? panels[editIndex] : null}
        metrics={metrics}
      />
    </PageWrapper>
  );
}

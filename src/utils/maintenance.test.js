import { describe, it, expect } from 'vitest';
import {
  statusLabel, statusPill, actionsForStatus, isTerminal, isOpen, logMeta,
} from './maintenance';

/**
 * Maintenance status presentation and the action gate.
 *
 * This file is **byte-identical in `fm-remote-monitoring-frontend`** (verified with `diff`), so these
 * cases are the shared contract. If one copy changes, change both.
 *
 * The backend's status enum is the authority — `MaintenanceRequest.status`:
 *   SCHEDULED · STARTED · SUCCESS · FAILED · CANCELLED · ON_HOLD · OVERDUE
 */

describe('statusLabel', () => {

  it('labels every status the backend can produce', () => {
    expect(statusLabel('SCHEDULED')).toBe('Scheduled');
    expect(statusLabel('STARTED')).toBe('In Progress');
    expect(statusLabel('ON_HOLD')).toBe('On Hold');
    expect(statusLabel('OVERDUE')).toBe('Overdue');
    expect(statusLabel('SUCCESS')).toBe('Completed');
  });

  it('does NOT conflate FAILED with CANCELLED', () => {
    /**
     * This was a real bug, found by the first test written in this repo. `STATUS_LABEL` mapped
     * `FAILED: 'Cancelled'`, so a maintenance job that FAILED displayed as one somebody called off.
     *
     * Those are materially different facts in a register a committee audits: a failed lift repair
     * needs re-attempting and may be a safety issue, a cancelled one was a decision. The rest of the
     * product already distinguished them — the filter dropdown says "Failed", the report chart
     * colours it red, and the detail page shows a `failureReason` — so only this map disagreed.
     */
    expect(statusLabel('FAILED')).toBe('Failed');
    expect(statusLabel('CANCELLED')).toBe('Cancelled');
  });

  it('falls back to the raw value, then a dash', () => {
    // An unknown status must still render something a human can report, not "undefined".
    expect(statusLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
    expect(statusLabel(null)).toBe('—');
    expect(statusLabel(undefined)).toBe('—');
  });
});

describe('statusPill', () => {

  it('colours a failure red, not grey', () => {
    // Same bug as the label: FAILED shared CANCELLED's grey, so a failed job was visually
    // indistinguishable from an abandoned one in a list.
    expect(statusPill('FAILED')).toBe('red');
    expect(statusPill('CANCELLED')).toBe('gray');
  });

  it('colours the rest as the product expects', () => {
    expect(statusPill('SUCCESS')).toBe('green');
    expect(statusPill('OVERDUE')).toBe('red');
    expect(statusPill('STARTED')).toBe('amber');
  });

  it('falls back to grey for an unknown status', () => {
    expect(statusPill('SOMETHING_NEW')).toBe('gray');
  });
});

describe('actionsForStatus', () => {

  it('lets scheduled and overdue work be started', () => {
    // OVERDUE is not a dead end: the job is late, not cancelled, and starting it is the point.
    expect(actionsForStatus('SCHEDULED')).toEqual(['start', 'edit', 'cancel']);
    expect(actionsForStatus('OVERDUE')).toEqual(['start', 'edit', 'cancel']);
  });

  it('offers complete and hold once started, but not start again', () => {
    const actions = actionsForStatus('STARTED');
    expect(actions).toContain('complete');
    expect(actions).toContain('hold');
    expect(actions).not.toContain('start');
  });

  it('only resumes or cancels from hold', () => {
    expect(actionsForStatus('ON_HOLD')).toEqual(['resume', 'cancel']);
  });

  it('offers no lifecycle action on a terminal status', () => {
    // A completed job must not be startable or cancellable — that would rewrite history.
    for (const status of ['SUCCESS', 'FAILED', 'CANCELLED']) {
      const actions = actionsForStatus(status);
      expect(actions).toEqual(['edit_terminal']);
      expect(actions).not.toContain('start');
      expect(actions).not.toContain('cancel');
    }
  });

  it('treats an unknown status as terminal, which is the safe default', () => {
    // Offering 'start' on a status this build does not understand risks an illegal transition.
    expect(actionsForStatus('SOMETHING_NEW')).toEqual(['edit_terminal']);
    expect(actionsForStatus(undefined)).toEqual(['edit_terminal']);
  });
});

describe('isTerminal / isOpen', () => {

  it('partitions every backend status into exactly one of the two', () => {
    // The important property: no status is both, and none is neither — otherwise a job disappears
    // from both the open list and the history, or appears in both.
    const ALL = ['SCHEDULED', 'STARTED', 'SUCCESS', 'FAILED', 'CANCELLED', 'ON_HOLD', 'OVERDUE'];
    for (const s of ALL) {
      expect(isTerminal(s)).toBe(!isOpen(s));
    }
  });

  it('counts SUCCESS, FAILED and CANCELLED as finished', () => {
    expect(['SUCCESS', 'FAILED', 'CANCELLED'].every(isTerminal)).toBe(true);
  });

  it('counts OVERDUE as still open', () => {
    // Overdue work is late, not done. Treating it as terminal would drop it out of every
    // open-work view — which is exactly where it needs to be loudest.
    expect(isOpen('OVERDUE')).toBe(true);
    expect(isTerminal('OVERDUE')).toBe(false);
  });

  it('treats an unknown status as neither', () => {
    // Deliberately asymmetric with actionsForStatus, which defaults to terminal: there the risk is
    // an illegal transition, here it is a job vanishing from a list. Both fail toward visibility.
    expect(isTerminal('SOMETHING_NEW')).toBe(false);
    expect(isOpen('SOMETHING_NEW')).toBe(false);
  });
});

describe('logMeta', () => {

  it('describes the actions an audit trail contains', () => {
    expect(logMeta('VENDOR_ASSIGNED').label).toBe('Vendor assigned');
    expect(logMeta('FAILED')).toEqual({ label: 'Marked failed', icon: 'x', kind: 'red' });
  });

  it('renders an unknown action rather than dropping the row', () => {
    // An audit trail with a silently missing entry is worse than one with an ugly label.
    expect(logMeta('NEW_THING')).toEqual({ label: 'NEW_THING', icon: 'calendar', kind: 'gray' });
  });
});

import { describe, it, expect } from 'vitest';
import { buildDedupeKey, claimDelivery, finaliseDelivery, getDeliveryStatus } from '../dedupe';

describe('dedupe', () => {
  it('buildDedupeKey produces a deterministic SHA-256 hex string', () => {
    const key = buildDedupeKey('abc-123');
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).toBe(buildDedupeKey('abc-123'));
  });

  it('claimDelivery returns true on first claim', () => {
    const key = buildDedupeKey(`first-claim-${Date.now()}`);
    expect(claimDelivery(key)).toBe(true);
  });

  it('claimDelivery returns false on duplicate claim', () => {
    const key = buildDedupeKey(`dup-test-${Date.now()}`);
    claimDelivery(key);
    expect(claimDelivery(key)).toBe(false);
  });

  it('finaliseDelivery updates status correctly', () => {
    const key = buildDedupeKey(`finalise-test-${Date.now()}`);
    claimDelivery(key);
    expect(getDeliveryStatus(key)).toBe('pending');
    finaliseDelivery(key, 'completed');
    expect(getDeliveryStatus(key)).toBe('completed');
  });

  it('finaliseDelivery sets failed status on error path', () => {
    const key = buildDedupeKey(`fail-test-${Date.now()}`);
    claimDelivery(key);
    finaliseDelivery(key, 'failed');
    expect(getDeliveryStatus(key)).toBe('failed');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { loadSyncConfig } from '../config';

describe('loadSyncConfig', () => {
  beforeEach(() => {
    delete process.env.EXTERNAL_TRACKER_URL;
    delete process.env.EXTERNAL_TRACKER_TOKEN;
    delete process.env.TRACKER_TIMEOUT_MS;
    delete process.env.TRACKER_MAX_RETRIES;
    delete process.env.TRACKER_RETRY_DELAY_MS;
  });

  it('throws when EXTERNAL_TRACKER_URL is missing', () => {
    process.env.EXTERNAL_TRACKER_TOKEN = 'tok';
    expect(() => loadSyncConfig()).toThrow('Missing required env: EXTERNAL_TRACKER_URL');
  });

  it('throws when EXTERNAL_TRACKER_TOKEN is missing', () => {
    process.env.EXTERNAL_TRACKER_URL = 'https://tracker.example.com';
    expect(() => loadSyncConfig()).toThrow('Missing required env: EXTERNAL_TRACKER_TOKEN');
  });

  it('returns config with defaults when optional vars are absent', () => {
    process.env.EXTERNAL_TRACKER_URL = 'https://tracker.example.com';
    process.env.EXTERNAL_TRACKER_TOKEN = 'secret';
    const cfg = loadSyncConfig();
    expect(cfg.trackerUrl).toBe('https://tracker.example.com');
    expect(cfg.trackerToken).toBe('secret');
    expect(cfg.timeoutMs).toBe(10_000);
    expect(cfg.maxRetries).toBe(3);
    expect(cfg.retryDelayMs).toBe(500);
  });

  it('respects overridden optional vars', () => {
    process.env.EXTERNAL_TRACKER_URL = 'https://tracker.example.com';
    process.env.EXTERNAL_TRACKER_TOKEN = 'secret';
    process.env.TRACKER_TIMEOUT_MS = '5000';
    process.env.TRACKER_MAX_RETRIES = '5';
    process.env.TRACKER_RETRY_DELAY_MS = '250';
    const cfg = loadSyncConfig();
    expect(cfg.timeoutMs).toBe(5000);
    expect(cfg.maxRetries).toBe(5);
    expect(cfg.retryDelayMs).toBe(250);
  });
});

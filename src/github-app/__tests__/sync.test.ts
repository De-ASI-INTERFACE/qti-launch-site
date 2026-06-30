import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { syncIssueToTracker } from '../sync';
import type { ExternalIssuePayload, SyncConfig } from '../types';

vi.mock('axios');
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };

const basePayload: ExternalIssuePayload = {
  title: 'Test Issue',
  body: 'Body text',
  githubUrl: 'https://github.com/org/repo/issues/1',
  issueNumber: 1,
  repoFullName: 'org/repo',
  deliveryKey: 'abc123',
};

const baseConfig: SyncConfig = {
  trackerUrl: 'https://tracker.example.com/issues',
  trackerToken: 'test-token',
  timeoutMs: 5000,
  maxRetries: 2,
  retryDelayMs: 10,
};

describe('syncIssueToTracker', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts payload to tracker with correct headers on success', async () => {
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ status: 200 });
    await expect(syncIssueToTracker(basePayload, baseConfig)).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledOnce();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      baseConfig.trackerUrl,
      basePayload,
      expect.objectContaining({
        headers: { 'X-Api-Key': baseConfig.trackerToken, 'Content-Type': 'application/json' },
        timeout: baseConfig.timeoutMs,
      })
    );
  });

  it('retries on 503 and succeeds on second attempt', async () => {
    const err503 = Object.assign(new Error('503'), { isAxiosError: true, response: { status: 503 } });
    Object.setPrototypeOf(err503, (await import('axios')).AxiosError.prototype);
    mockedAxios.post = vi.fn()
      .mockRejectedValueOnce(err503)
      .mockResolvedValueOnce({ status: 200 });
    await expect(syncIssueToTracker(basePayload, { ...baseConfig, maxRetries: 2, retryDelayMs: 1 })).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('throws immediately on non-retryable 400 error', async () => {
    const err400 = Object.assign(new Error('400'), { isAxiosError: true, response: { status: 400 } });
    Object.setPrototypeOf(err400, (await import('axios')).AxiosError.prototype);
    mockedAxios.post = vi.fn().mockRejectedValue(err400);
    await expect(syncIssueToTracker(basePayload, baseConfig)).rejects.toThrow('400');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('exhausts all retries and throws on persistent 500', async () => {
    const err500 = Object.assign(new Error('500'), { isAxiosError: true, response: { status: 500 } });
    Object.setPrototypeOf(err500, (await import('axios')).AxiosError.prototype);
    mockedAxios.post = vi.fn().mockRejectedValue(err500);
    const cfg = { ...baseConfig, maxRetries: 2, retryDelayMs: 1 };
    await expect(syncIssueToTracker(basePayload, cfg)).rejects.toThrow('500');
    expect(mockedAxios.post).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});

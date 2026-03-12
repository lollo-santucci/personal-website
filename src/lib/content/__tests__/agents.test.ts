/**
 * Integration tests for the Agent YAML/JSON content loader.
 *
 * - Property 3 (YAML/JSON parsing round trip) for Agent type
 *
 * **Validates: Requirements 4.3, 4.5**
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getAgents, getAgentBySlug } from '../agents';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(
    tmpdir(),
    `agents-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(base, { recursive: true });
  return base;
}

/** Tracked temp dirs for cleanup. */
const tempDirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

/** Helper: set process.cwd() to a temp root and create content/agents/ inside it. */
async function setupTempAgents(): Promise<string> {
  const root = await makeTempDir();
  tempDirs.push(root);
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  await mkdir(join(root, 'content', 'agents'), { recursive: true });
  return root;
}

const YAML_AGENT = `name: Sales Agent
slug: sales-agent
role: Sales and estimation
personality: Professional and helpful
capabilities:
  - estimation
  - scheduling
status: coming-soon
portrait: /assets/agents/sales.png
`;

const JSON_AGENT = {
  name: 'Support Agent',
  slug: 'support-agent',
  role: 'Customer support',
  personality: 'Patient and thorough',
  capabilities: ['troubleshooting', 'faq'],
  status: 'active',
};

describe('Property 3: YAML/JSON parsing round trip — Agent', () => {
  /**
   * **Validates: Requirements 4.3, 4.5**
   *
   * For any valid YAML or JSON file in content/agents/ containing all required
   * Agent fields, parsing the file and then retrieving it by slug SHALL return
   * a typed Agent object where each field matches the original value.
   */

  it('round-trips a YAML agent via getAgents()', async () => {
    const root = await setupTempAgents();
    await writeFile(join(root, 'content', 'agents', 'sales-agent.yaml'), YAML_AGENT);

    const agents = await getAgents();
    expect(agents).toHaveLength(1);

    const agent = agents[0]!;
    expect(agent.name).toBe('Sales Agent');
    expect(String(agent.slug)).toBe('sales-agent');
    expect(agent.role).toBe('Sales and estimation');
    expect(agent.personality).toBe('Professional and helpful');
    expect(agent.capabilities).toEqual(['estimation', 'scheduling']);
    expect(agent.status).toBe('coming-soon');
    expect(String(agent.portrait)).toBe('/assets/agents/sales.png');
  });

  it('round-trips a JSON agent via getAgentBySlug()', async () => {
    const root = await setupTempAgents();
    await writeFile(
      join(root, 'content', 'agents', 'support-agent.json'),
      JSON.stringify(JSON_AGENT, null, 2),
    );

    const agent = await getAgentBySlug('support-agent');
    expect(agent).not.toBeNull();
    expect(agent!.name).toBe('Support Agent');
    expect(String(agent!.slug)).toBe('support-agent');
    expect(agent!.role).toBe('Customer support');
    expect(agent!.personality).toBe('Patient and thorough');
    expect(agent!.capabilities).toEqual(['troubleshooting', 'faq']);
    expect(agent!.status).toBe('active');
    // No portrait field — should be undefined
    expect(agent!.portrait).toBeUndefined();
  });

  it('loads both YAML and JSON agents from the same directory', async () => {
    const root = await setupTempAgents();
    await writeFile(join(root, 'content', 'agents', 'sales-agent.yaml'), YAML_AGENT);
    await writeFile(
      join(root, 'content', 'agents', 'support-agent.json'),
      JSON.stringify(JSON_AGENT, null, 2),
    );

    const agents = await getAgents();
    expect(agents).toHaveLength(2);

    const slugs = agents.map((a) => String(a.slug)).sort();
    expect(slugs).toEqual(['sales-agent', 'support-agent']);
  });

  it('getAgentBySlug prefers .yaml over .json when both exist', async () => {
    const root = await setupTempAgents();

    // Write both formats for the same slug
    await writeFile(join(root, 'content', 'agents', 'sales-agent.yaml'), YAML_AGENT);
    await writeFile(
      join(root, 'content', 'agents', 'sales-agent.json'),
      JSON.stringify({ ...JSON_AGENT, slug: 'sales-agent', name: 'JSON Version' }, null, 2),
    );

    // .yaml is first in extensions array, so it should be preferred
    const agent = await getAgentBySlug('sales-agent');
    expect(agent).not.toBeNull();
    expect(agent!.name).toBe('Sales Agent');
  });

  it('returns null for a non-existent agent slug', async () => {
    await setupTempAgents();

    const result = await getAgentBySlug('nonexistent-agent');
    expect(result).toBeNull();
  });

  it('returns empty array when agents directory is missing', async () => {
    const root = await makeTempDir();
    tempDirs.push(root);
    vi.spyOn(process, 'cwd').mockReturnValue(root);
    // Do NOT create content/agents/

    const agents = await getAgents();
    expect(agents).toEqual([]);
  });
});

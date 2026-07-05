#!/usr/bin/env node
'use strict';

const dns = require('dns');
const { performance } = require('perf_hooks');

const DNS_SERVERS = [
  { name: 'Google', ip: '8.8.8.8' },
  { name: 'Google (secondary)', ip: '8.8.4.4' },
  { name: 'Cloudflare', ip: '1.1.1.1' },
  { name: 'Cloudflare (secondary)', ip: '1.0.0.1' },
  { name: 'Quad9', ip: '9.9.9.9' },
  { name: 'OpenDNS', ip: '208.67.222.222' },
  { name: 'AdGuard DNS', ip: '94.140.14.14' },
  { name: 'CleanBrowsing', ip: '185.228.168.9' },
  { name: 'DNS4EU', ip: '86.54.11.13' },
  { name: 'Control D', ip: '76.76.2.0' },
  { name: 'NextDNS', ip: '45.90.28.0' },
  { name: 'DNS.WATCH', ip: '84.200.69.80' },
  { name: 'HaGeZi DNS (Nuremberg)', ip: '159.69.155.94' },
  { name: 'HaGeZi DNS (Falkenstein)', ip: '188.34.161.210' },
  { name: 'HaGeZi DNS (Helsinki)', ip: '95.217.163.17' },
  { name: 'Gcore DNS', ip: '95.85.95.85' },
];

const TEST_DOMAIN = 'example.com';
const ATTEMPTS = 4;
const TIMEOUT_MS = 3000;

function resolveWithTimeout(resolver, domain, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    resolver.resolve4(domain, (err, addresses) => {
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(addresses);
    });
  });
}

async function measureServer(server) {
  const resolver = new dns.Resolver();
  resolver.setServers([server.ip]);

  const times = [];
  let failures = 0;

  for (let i = 0; i < ATTEMPTS; i++) {
    const start = performance.now();
    try {
      await resolveWithTimeout(resolver, TEST_DOMAIN, TIMEOUT_MS);
      times.push(performance.now() - start);
    } catch {
      failures++;
    }
  }

  if (times.length === 0) {
    return { ...server, avg: null, min: null, max: null, failures };
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return {
    ...server,
    avg,
    min: Math.min(...times),
    max: Math.max(...times),
    failures,
  };
}

function formatMs(value) {
  return value === null ? 'timeout' : `${value.toFixed(1)} ms`;
}

async function main() {
  console.log(
    `Checking DNS latency to ${DNS_SERVERS.length} servers (${ATTEMPTS} queries each, domain: ${TEST_DOMAIN})...\n`
  );

  const results = await Promise.all(DNS_SERVERS.map(measureServer));

  results.sort((a, b) => {
    if (a.avg === null) return 1;
    if (b.avg === null) return -1;
    return a.avg - b.avg;
  });

  const nameWidth = Math.max(...results.map((r) => r.name.length), 'Provider'.length) + 2;
  const header = `${'Provider'.padEnd(nameWidth)}${'IP'.padEnd(16)}${'Avg'.padEnd(10)}${'Min'.padEnd(10)}${'Max'.padEnd(10)}Failures`;
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of results) {
    console.log(
      `${r.name.padEnd(nameWidth)}${r.ip.padEnd(16)}${formatMs(r.avg).padEnd(10)}${formatMs(r.min).padEnd(10)}${formatMs(r.max).padEnd(10)}${r.failures}/${ATTEMPTS}`
    );
  }
}

main();

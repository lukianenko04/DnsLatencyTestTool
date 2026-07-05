# DNS Latency Check

A small Node.js CLI that measures DNS resolution latency from your machine to a list of popular public DNS providers, so you can pick the fastest one for your network.

It uses Node's built-in `dns` module to send real DNS queries directly to each provider's server (bypassing your system resolver), times the responses, and prints a table sorted from fastest to slowest.

## Providers checked

- Google (`8.8.8.8`, `8.8.4.4`)
- Cloudflare (`1.1.1.1`, `1.0.0.1`)
- Quad9 (`9.9.9.9`)
- OpenDNS (`208.67.222.222`)
- AdGuard DNS (`94.140.14.14`)
- CleanBrowsing (`185.228.168.9`)
- DNS4EU (`86.54.11.13`)
- Control D (`76.76.2.0`)
- NextDNS (`45.90.28.0`)
- DNS.WATCH (`84.200.69.80`)
- HaGeZi DNS — Nuremberg, Falkenstein, Helsinki
- Gcore DNS (`95.85.95.85`)

## Requirements

- Node.js (no external dependencies)

## Usage

```bash
node check-dns-latency.js
```

or, via npm:

```bash
npm start
```

### Example output

```
Checking DNS latency to 16 servers (4 queries each, domain: example.com)...

Provider                IP              Avg       Min       Max       Failures
--------------------------------------------------------------------------------
Cloudflare (secondary)  1.0.0.1         11.4 ms   7.5 ms    16.4 ms   0/4
CleanBrowsing           185.228.168.9   25.8 ms   21.3 ms   30.8 ms   0/4
Quad9                   9.9.9.9         25.9 ms   22.2 ms   30.6 ms   0/4
...
```

## How it works

For each provider, the script:

1. Creates a `dns.Resolver` pointed at that provider's IP.
2. Sends 4 `resolve4` queries for `example.com` (a domain that's globally cached with a long TTL, so the timing reflects network round-trip rather than resolution work).
3. Records the average, min, and max response time, plus any timeouts/failures.

Results are sorted by average latency, fastest first.

## Configuration

You can tweak the test by editing the constants at the top of `check-dns-latency.js`:

- `DNS_SERVERS` — the list of providers/IPs to test
- `TEST_DOMAIN` — the domain to resolve (default: `example.com`)
- `ATTEMPTS` — number of queries per server (default: `4`)
- `TIMEOUT_MS` — timeout per query in milliseconds (default: `3000`)

## License

MIT

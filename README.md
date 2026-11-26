# d3Tools

## Flocking with Sperm

Open `sperm/index.html` in a browser (internet access is needed for D3 v3).
Use `sperm/index.html?mode=swimming` for the original non-flocking comparison.
Deposit and Withdraw add/remove swimmers; the display scales to its container.

The original code was located in [Taylor White's GitHub Gist](https://gist.github.com/taylorchasewhite/f5ede58351f8e7e5e3cd31cfc1ce2e7e),
not in this repository. The visualization is based on
[Mike Bostock's Spermatozoa](https://gist.github.com/mbostock/1136236).
The original hosted examples are `https://old.taylorchasewhite.com/d3/sperm/sperm.html`
and `https://old.taylorchasewhite.com/d3/sperm/sperm1.html`.

### November 25, 2026 — AI-assisted repair

Recovered the demo with AI assistance, corrected separation/alignment/cohesion
steering to update velocity from a consistent simulation frame, bounded speed,
and aligned heads with actual motion. Fixed zero-speed tails, wall reflection,
and population controls. The renderer retains D3 v3 and the swimming comparison.

Run the focused regression tests with Node.js 18 or newer:

```sh
node --test sperm/boids.test.js
```

The [blog post](https://taylorchasewhite.com/sperm-flocking) embeds self-contained
copies of `index.html`, with `boids.js` and `sperm.js` inlined into sandboxed
`srcdoc` iframes (`sandbox="allow-scripts"`). The swimming comparison sets
`data-flocking="false"` on its body. D3 remains an external HTTPS dependency.
This avoids needing write access to the old web server's `/d3/` directory.
The historical hosted files and Gist remain unchanged.

When publishing another repair, inline the two local scripts, HTML-escape the
complete document for the `srcdoc` attribute, and replace only these two post
embeds. Keep the source here in sync with both embedded copies. WordPress
revisions retain the previous post; the main site's WordPress data cache can
take up to an hour to refresh.
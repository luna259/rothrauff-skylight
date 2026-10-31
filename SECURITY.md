# Rothrauff Outdoor security changes

This is a modified Skylight launcher, not a security certification. Upstream's
model compatibility evidence does not establish compatibility with this TV.

Changes in this fork:

- Removed the helper's HTTP server entirely. No unauthenticated command or log
  endpoint, wildcard CORS header, or listener on port 8130 remains.
- Foreground/helper communication uses Tizen app-control IPC. The helper checks
  the OS-provided callerAppId and operation, rejects missing/foreign callers,
  and validates bounded command data. If the firmware does not expose caller
  identity it fails closed; foreground return handling remains available.
- App IDs, command fields, list sizes, pause durations, and status responses are
  bounded. IDs are encoded when appended to the local status URL.
- Widget network policy permits only http://127.0.0.1:8001. CSP blocks remote
  scripts, frames, plugins, forms, and external image loads. Inline styles are
  retained because the existing scenery uses generated style attributes.
- App metadata cannot supply network image URLs. Only bundled icon paths load.
- The optional SmartThings tool requires an explicit device ID, validates IDs,
  refuses cross-device name mismatches, disables HTTP redirects, and omits raw
  response bodies from error messages. It has not been executed or validated
  with a live account; do not treat that optional path as installation-tested.
- Certificates, account tokens, local installers, and TV records are ignored by
  Git. The Python packaging tool excludes browser mocks and packages only the
  widget directory. No signing certificate is shipped with this fork.

Remaining boundaries:

- This still requires Developer Mode and application-list/launch permissions.
  The helper makes HTTP requests to Samsung's loopback status service. Its
  Node.js runtime is part of the TV platform; widget CSP does not sandbox Node.
- Home-button return depends on undocumented Samsung behavior and must be
  verified on-device. No root, firmware patch or system-database edit is used.
- Automatic cold-boot launch is not configured by installation. Upstream's
  SmartThings rules require account permissions and Samsung cloud availability.
- The separate Apps2Samsung installer and Samsung signing infrastructure are
  additional dependencies, not covered by these application regression tests.
- Developer Mode should be restricted to a trusted store network. Keep guest
  Wi-Fi separated from the TV; do not forward developer ports to the internet.

Run `node --test tests/security.test.cjs` for the attack regression tests.
Build the unsigned widget with `python3 tools/build-widget.py`.

The initial retail screen says only “Rothrauff Outdoor.” Press Down or OK to
show launcher controls. Press Back to return to the store display. Home-return
and startup behavior require separate device verification.

Recovery: uninstall the Rothrauff Outdoor app from Samsung Apps Settings.
No stock apps are removed or disabled. If optional cloud rules are ever added,
remove those rules separately. Keep the original Samsung Home available.

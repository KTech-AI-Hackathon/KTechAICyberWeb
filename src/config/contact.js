/**
 * Contact form configuration (issue #270).
 *
 * The site is statically hosted (no backend we control), so the contact form
 * must NOT fake a successful submission. Behaviour is driven by this config:
 *
 *   - If `endpoint` is set (a static-site form backend such as Formspree /
 *     FormSubmit / Web3Forms / getform), `Contact.vue` performs a real
 *     `fetch` POST and reports the genuine success/error result.
 *   - If `endpoint` is null/empty, the form instead shows a clear DEMO notice
 *     so the user knows nothing was actually sent — never a fake "success".
 *
 * Security: the endpoint is a public form-handling URL (Formspree-style),
 * not a secret — these services intentionally expose a public POST endpoint.
 * It is read from `VITE_CONTACT_ENDPOINT` so deployments can override it
 * without code changes; nothing here is a hardcoded credential.
 *
 * The config is exposed as a `reactive` singleton so the running app reads
 * the build-time/env values, while tests can override it per-case via
 * `contactConfig.endpoint = ...` and have Contact.vue observe the change.
 */
import { reactive } from 'vue'

const initialEndpoint =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_CONTACT_ENDPOINT) ||
  null

const initialDemoEmail =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_CONTACT_DEMO_EMAIL) ||
  'contact@ktechai.example'

export const contactConfig = reactive({
  // Static form-backend URL, or null to fall back to demo-notice mode.
  endpoint: initialEndpoint,
  // Fallback contact address shown in the demo notice / error copy.
  demoEmail: initialDemoEmail,
})

export default contactConfig

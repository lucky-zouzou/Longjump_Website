# Wholesale lead capture

The homepage and `/#koleksi` serve Indonesian store owners arriving from Google Ads. They can now request a catalog and wholesale quote without selecting a product first.

## Entry points and form

- Homepage, header, collection panel, and a single persistent contact bar open the existing inquiry form. On mobile, the hero copy appears before the photograph and the contact bar stays at the bottom with safe-area spacing.
- WhatsApp is the default contact method; email remains available. Name, contact, city, and consent remain required. Store name and business type are optional. Quantity, timing, country, and notes are expandable; Indonesia remains the editable default country.
- Selected models and quantities remain editable in an expandable section. OEM still requires a project description; configured required custom fields remain visible and required.
- Indonesian `08…`, `8…`, and `628…` phone formats normalize to `+628…`. Explicit international numbers are preserved. Invalid characters still fail validation.
- Successful submission requires a server receipt. Existing request keys, duplicate protection, manual sales confirmation, and optional WhatsApp continuation remain in place. Buyer details are not persisted to browser storage.
- Existing analytics and Google Tag Manager configuration are unchanged. This release does not claim a measured conversion increase.

## Verification

Local checks cover TypeScript, production build, inquiry validation, catalog and image assets, operations, bilingual admin, and engagement. Additional inquiry assertions cover minimal leads, phone normalization, required fields, custom fields, multi-model inquiries, and OEM validation.

Browser checks used an isolated local data directory with synthetic contacts: WhatsApp and email submissions, invalid contact recovery, multi-model quantities, OEM submission, and reopening a collapsed section containing an invalid quantity. Saved receipts were verified in the local database. No test inquiry was sent to production.

Responsive views were inspected at 320 × 568, 390 × 844, 768 × 1024, and 1440 × 900. The narrow view has no horizontal overflow; the normal mobile view places the essential contact fields and primary submit action together. Physical-device keyboard behavior was not tested.

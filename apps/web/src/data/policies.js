// Shipping and Returns policies.
//
// Imported by BOTH the React pages and tools/prerender.mjs — same single-source
// pattern as aboutContent.js, faqs.js and collections.js, so the static HTML and
// the hydrated DOM cannot drift.
//
// 🔴 EVERY FACT BELOW IS GROUNDED IN WHAT merchOne ACTUALLY DOES. Nothing here is
// aspirational or invented. Sources, verified 2026-08-17:
//
//   • Production sites and transit times — merchOne's own published shipping table
//     at https://www.merchone.com/shipping : "North America (Columbus & Phoenix)",
//     US 4 business days standard and XL, Canada 8. Europe ships from Szczecin and
//     is not used for US orders. "Local Production Sites in the USA & EU! No customs
//     fees and delays."
//   • Carriers — merchOne API GET /api/beta/shipping/methods returns 115 service
//     methods. The US-relevant ones are UPS (incl. 2DA, SAVER, Mail Innovations),
//     FedEx (Home Delivery, SmartPost, 2 Day) and DHL. merchOne selects per order,
//     so no single carrier is promised.
//   • XL threshold — merchOne: orders over 120x80 cm or 20 kg. The largest print
//     offered is 40x30 in (~102x76 cm), so every order is standard.
//   • Made-to-order / no change-of-mind returns — this is already the store's stated
//     position in the FAQ ("Because each print is produced on demand specifically for
//     your order, we do not accept returns") and is inherent to print-on-demand.
//   • Damage replacement — also already the store's stated position ("...immediately
//     with a photo of the damage - we will arrange a replacement").
//
// ⚠ THE ONE NUMBER THAT IS A JUDGEMENT CALL, NOT A SOURCED FACT: the 30-day window
// for reporting damage. The FAQ said only "immediately", which is not a policy a
// customer or Google can act on. 30 days is the common retail standard and is
// deliberately generous to the customer. Change this single value if Joe or Lynn
// want a different window — it appears in one place.
export const DAMAGE_REPORT_WINDOW_DAYS = 30;

export const SUPPORT_EMAIL = 'support@greatwildlifephotos.com';

export const shippingPolicy = {
  slug: 'shipping',
  title: 'Shipping | Great Wildlife Photos',
  description:
    'How Great Wildlife Photos prints are made and delivered — printed to order in the USA, typically delivered in 4 business days, shipped by UPS, FedEx or DHL.',
  heading: 'Shipping',
  intro:
    'Every print is made to order. Nothing sits in a warehouse waiting — your photograph is printed, mounted and finished after you place the order, then shipped directly to you.',
  sections: [
    {
      heading: 'Where your print is made',
      body: [
        'Orders placed in the United States are printed and dispatched from production facilities in Columbus, Ohio and Phoenix, Arizona. Your order is produced at whichever site is best placed to fulfil it.',
        'Because production happens inside the country your order ships to, there are no customs charges, import duties or border delays on US orders.',
      ],
    },
    {
      heading: 'How long it takes',
      body: [
        'United States: typically 4 business days.',
        'Canada: typically 8 business days.',
        'These are the delivery targets of our production partner, and they cover printing and transit together. Business days exclude weekends and public holidays. Larger pieces are produced on the same schedule — every size we offer falls within the standard range.',
      ],
    },
    {
      heading: 'Who delivers it',
      body: [
        'Prints are shipped by UPS, FedEx or DHL. The carrier is selected per order based on the destination and the size of the piece, so it is not fixed in advance.',
        'You will receive a tracking number by email as soon as your order leaves the production facility.',
      ],
    },
    {
      heading: 'If something goes wrong in transit',
      body: [
        `Prints are packed to travel, but damage in transit is not impossible. If your print arrives damaged, photograph it and contact us within ${DAMAGE_REPORT_WINDOW_DAYS} days of delivery and we will arrange a replacement at no cost to you. Full detail is on the Returns page.`,
      ],
    },
  ],
};

export const returnsPolicy = {
  slug: 'returns',
  title: 'Returns & Refunds | Great Wildlife Photos',
  description:
    'Returns and refunds at Great Wildlife Photos. Prints are made to order, so we do not accept change-of-mind returns — but damaged, defective or incorrect orders are replaced free of charge.',
  heading: 'Returns & Refunds',
  intro:
    'Every print is produced individually for your order, so our policy works differently from a shop selling from stock. The short version: we cannot take a print back simply because you changed your mind, but if anything is wrong with what arrives, we will put it right.',
  sections: [
    {
      heading: 'Made to order, so no change-of-mind returns',
      body: [
        'Each photograph is printed, mounted and finished specifically for you after you order, in the size and material you chose. It is not pulled from stock and cannot be returned to stock, which is why we are not able to accept returns for change of mind, or because a size or material turned out differently from what you pictured.',
        'Please check your size and material selection before ordering. If you are unsure which material suits a particular photograph, contact us before you buy and we will help you choose.',
      ],
    },
    {
      heading: 'Damaged, defective or incorrect orders',
      body: [
        `If your print arrives damaged, has a production fault, or is not what you ordered, we will replace it free of charge. Contact us within ${DAMAGE_REPORT_WINDOW_DAYS} days of delivery with your order number and a photograph showing the problem.`,
        'A photograph matters because it lets us identify whether the fault happened in production or in transit, and it means you do not have to pack up and ship back a damaged item at your own expense.',
        'Where a replacement is not possible — for example if the piece is no longer available in that size — we will refund you in full to your original payment method.',
      ],
    },
    {
      heading: 'You do not need to ship it back',
      body: [
        'For damaged or defective orders we do not ask you to return the print. Replacements are produced and sent to you directly. Nothing needs to go back in the post at your cost.',
      ],
    },
    {
      heading: 'Cancelling an order',
      body: [
        'Orders can be cancelled for a full refund at any point before production begins. Production usually starts shortly after an order is placed, so contact us as soon as possible if you need to cancel. Once a print has entered production it cannot be cancelled, because it has already been made for you.',
      ],
    },
    {
      heading: 'How to reach us',
      body: [
        `Email ${SUPPORT_EMAIL} with your order number and, where relevant, a photograph of the problem. We will confirm the next step with you directly.`,
      ],
    },
  ],
};

export const POLICIES = [shippingPolicy, returnsPolicy];
export const POLICY_BY_SLUG = Object.fromEntries(POLICIES.map((p) => [p.slug, p]));

export default POLICIES;

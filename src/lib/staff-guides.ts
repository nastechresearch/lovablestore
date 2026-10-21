export type StaffGuideOwner = "Studio" | "Fulfilment" | "Finance";

export type StaffGuideStep = {
  title: string;
  detail: string;
};

export type StaffGuide = {
  slug: string;
  title: string;
  owner: StaffGuideOwner;
  summary: string;
  steps: readonly StaffGuideStep[];
  why: string;
  escalateIf: readonly string[];
};

export const STAFF_GUIDES: readonly StaffGuide[] = [
  {
    slug: "pack-and-check",
    title: "Pack and check",
    owner: "Fulfilment",
    summary:
      "From paid queue to sealed parcel: pick the exact piece, check it in daylight, wrap it, include the note and leave photo evidence behind.",
    steps: [
      {
        title: "Work the paid queue before the dispatch cut-off",
        detail:
          "Open Orders → Paid (/admin/orders?status=PAID) and work oldest first. The cut-off saved in Store settings is 14:00 SAST by default: paid before then ships same day, paid after moves to the next business day. Screen R5 000+ orders against the fraud guide before picking.",
      },
      {
        title: "Print the packing slip, not the invoice",
        detail:
          "Use Documents → Packing slip on the order detail. It deliberately omits prices and carries a tick box for every line, so it doubles as the pick list. Keep the tax invoice digital unless the customer has specifically asked for a printed copy — gift parcels must never show prices.",
      },
      {
        title: "Pick by SKU, size and quantity",
        detail:
          "Match the line's SKU, size and quantity against the piece in hand, not the product photo. Watches and fragrance are the easiest lines to substitute by mistake. Pick local studio stock first; supplier lines may only be picked once their line status is RECEIVED.",
      },
      {
        title: "Check quantity and quality at the bench",
        detail:
          "Count every piece, every pair and every set. Check watch crystals, links and clasps, fragrance seals and sprayers, stitching, zips and hardware. Wipe fingerprints, remove any security tag and photograph any defect before hunting for a replacement.",
      },
      {
        title: "Wrap every order in house wrap",
        detail:
          "Gift wrap is complimentary store-wide, so every parcel gets ivory tissue and the oxblood ribbon with the LS monogram. Keep the gift card on top of the tissue rather than inside the product box, so it is the first thing the recipient sees.",
      },
      {
        title: "Hand-write the gift note exactly",
        detail:
          "Transcribe the gift note from the order detail word for word, including its spelling. Do not add a message, correct grammar or include a price. If a gift order has no note, pack it without a card rather than inventing one.",
      },
      {
        title: "Complete and sign the packing slip",
        detail:
          "Tick every line, then sign Packed by. For orders of R5 000 or more, or mixed parcels with fragrance and watches, get a second staff member to sign Checked by. The signed slip is internal proof of who packed what.",
      },
      {
        title: "Seal the box and attach the label",
        detail:
          "Tape both seams and mark the outer box FRAGILE. Attach the courier label only after the live tracking number has been loaded on the order (see Courier labels). Place it on the largest flat face, clear of seams and edges, with the barcode flat and readable.",
      },
      {
        title: "Take photo evidence before it leaves the bench",
        detail:
          "Take three frames: contents laid out with the packing slip, the wrapped gift with its note, and the sealed box with the label and tracking number readable. Save them as LS-<order number>-packed in the studio evidence folder. Courier claims and chargebacks depend on these photos.",
      },
      {
        title: "Update the lines, then the order",
        detail:
          "Set each line to PACKED, then set the order to PACKED, and move the parcel to the courier bay. If any line is short, damaged or still waiting on a supplier, leave the order un-packed and flag it rather than shipping a partial surprise.",
      },
    ],
    why: "The bench is the last place a wrong size, missing note or damaged piece can be caught before it becomes a return, a courier claim or a chargeback. Unpriced packing slips protect gift recipients, while dated photo evidence proves exactly what left the Johannesburg studio.",
    escalateIf: [
      "A line is short, damaged or leaking and no replacement is on the shelf.",
      "A gift note is illegible, missing from a gift order, or names a recipient who is not on the order.",
      "A R5 000+ order is flagged by the fraud checks, or the customer asks to change the delivery address after payment.",
      "A supplier line has not arrived but the rest of the order is ready — do not split, substitute or promise a date without approval.",
    ],
  },
  {
    slug: "courier-labels",
    title: "Courier labels",
    owner: "Fulfilment",
    summary:
      "Confirm the delivery details, load the live tracking reference, print a scannable label and get a handover scan before the parcel leaves the building.",
    steps: [
      {
        title: "Ship paid, packed orders only",
        detail:
          "The order must show payment status paid and order status PACKED. Never print a label for a pending or unpaid order, and never courier a demo checkout — demo payments collect no money. If the status is wrong, fix it on the order before booking anything.",
      },
      {
        title: "Confirm the address and phone",
        detail:
          "Street address, suburb, province and four-digit postal code must agree, and the phone must be a reachable South African mobile. Couriers cannot deliver to a PO box, and secure complexes or farm gates need a contact number that answers. Check the customer delivery notes for access instructions.",
      },
      {
        title: "Resolve address problems before booking",
        detail:
          "Admin has no address editor on the order. If the customer needs a different address, get written confirmation from the order email and escalate to the owner for a manual correction — or cancel and ask them to re-order. Never relabel a parcel to an address that has only been given by phone or WhatsApp.",
      },
      {
        title: "Book the courier and capture the tracking number",
        detail:
          "Use the store's courier account; The Courier Guy is the default named in the order form. South African addresses only — escalate cross-border requests. Imported lines must be RECEIVED and PACKED first. Record the waybill or tracking number the courier issues against this order, not a previous one.",
      },
      {
        title: "Load courier and tracking on the order before printing",
        detail:
          "Enter both in the Order status panel on the order detail and save. The label barcode uses the tracking number when present and falls back to the order number when it is blank. A blank tracking number means the customer cannot track and the courier has nothing to scan at handover.",
      },
      {
        title: "Print the label at 100%",
        detail:
          "Open Documents → Courier label (/admin/orders/[id]/label). Check the from address, customer name, piece count, phone, gift flag and FRAGILE handling. Print at 100% on A6 or a 4×6 thermal label. Never choose “fit to page”: a scaled barcode can fail at the courier's scanner.",
      },
      {
        title: "Attach the label properly",
        detail:
          "Place it on the largest flat face, clear of seams, edges and opening flaps. Cover or remove old barcodes and supplier labels, and use a clear label pouch rather than taping directly over the barcode. If you reprint, destroy the previous label so two references cannot circulate.",
      },
      {
        title: "Get a handover scan",
        detail:
          "Hand parcels over in person, count them against the courier manifest and keep the scan sheet or a photo of the waybill. Set the order and its lines to SHIPPED only after the courier has scanned them — that scan is the start of the courier's liability and the store's proof of dispatch.",
      },
      {
        title: "Send tracking and close the loop",
        detail:
          "Point customers to /order/<order number>?email=<order email>, where the tracking reference appears. Mark DELIVERED only on the courier's proof of delivery, never on the estimated date. Check open shipments daily and chase any parcel with no movement for 48 hours.",
      },
    ],
    why: "The tracking number is the thread between the order, the customer and any courier claim. A label printed before tracking exists, or a parcel handed over without a scan, leaves the store unable to prove dispatch, trace a parcel or claim a loss.",
    escalateIf: [
      "The courier cannot find or scan the tracking number within 24 hours of booking.",
      "The address is a PO box, freight forwarder or hotel, or the delivery is outside South Africa.",
      "A label prints blurred, scaled, or with the wrong customer or tracking details.",
      "A parcel is refused, returned to sender, or shows no movement for two business days.",
      "A R5 000+ parcel is being handed over and no scan sheet or waybill can be obtained.",
    ],
  },
  {
    slug: "invoices-and-vat",
    title: "Invoices and VAT",
    owner: "Finance",
    summary:
      "Issue one compliant tax invoice for every paid order, keep the VAT sequence intact, and handle reprints, refunds and credit notes without editing the original.",
    steps: [
      {
        title: "Issue only after payment",
        detail:
          "The trigger is payment status paid plus a completed PayFast payment reference on the order. Pending or unpaid orders get no tax invoice; the packing slip is marked “Not a tax invoice”. Demo checkouts collect no money — never send a demo invoice to a customer.",
      },
      {
        title: "Verify the store identity in settings",
        detail:
          "Open Store settings (/admin/settings) and check the trading name, company registration, VAT number, registered address, invoice email and phone. All of them print in the invoice header; current defaults are Lovable Store, Reg. 2026/493821/07, VAT 4890317265, 18 Keyes Avenue, Rosebank, Johannesburg, 2196. If anything is wrong, stop and have finance fix settings — never edit the PDF or write over a printed invoice.",
      },
      {
        title: "Verify the customer and company details",
        detail:
          "The invoice is issued to the name, email, phone and delivery address on the order. For a company claim, ask for the registered company name and VAT number in writing before issue. If those details are not on the order, do not hand-edit the invoice — escalate so finance can handle the correction properly.",
      },
      {
        title: "Generate from the order, never by hand",
        detail:
          "Documents → Tax invoice (/admin/orders/[id]/invoice) produces INV-YYYY-<order digits without LS->. The number is deterministic, so never renumber, split or reuse it. Check every line, quantity, discount, delivery charge and the total in ZAR, plus VAT at 15% included and the ex-VAT subtotal.",
      },
      {
        title: "Deliver it to the customer",
        detail:
          "Choose Print / save PDF, save a copy in the finance folder and email it from the store inbox to the order email. The customer can also open /order/<order number>/invoice?email=<order email>; signed-in customers can open the same page without the email key. Do not send it to a different address without a request from the order email.",
      },
      {
        title: "Reprints use the same route",
        detail:
          "Reprint from the order's invoice route. Because the number is tied to the order, a reprint cannot create a duplicate or leave a gap in the sequence. If the content itself is wrong, do not issue a second version under the same number: escalate for a credit note and corrected paperwork.",
      },
      {
        title: "Refund in PayFast before changing status",
        detail:
          "Process the refund in PayFast first and confirm it reflects, then set payment status to refunded. Never mark refunded on a promise. Refunding and cancelling are separate: Cancel order restocks every item, releases promo use and cannot be undone, so use it only when goods are back or never shipped, with finance approval.",
      },
      {
        title: "Credit notes for every adjustment",
        detail:
          "There is no automated credit-note generator in admin. Finance issues a credit note that references the original invoice number and order, states the reason (return, damage, goodwill or correction), shows the VAT portion at 15% and records the PayFast refund reference. Number it CN-YYYY-<order digits> and file it beside the invoice; never alter the original.",
      },
      {
        title: "Keep the VAT trail auditable",
        detail:
          "Retain invoices, credit notes and refund proof for at least five years for SARS, keep invoice numbers sequential and reconcile PayFast settlements to paid orders at month end. Every paid order should have an invoice; every refund should have a credit note referencing one.",
      },
    ],
    why: "A valid South African tax invoice is the customer's proof of VAT paid, the store's sales record and a core piece of chargeback evidence. A deterministic number and an unbroken sequence keep the VAT records auditable, while edited PDFs or duplicate invoices create tax and dispute risk.",
    escalateIf: [
      "The VAT number, registration or registered address is missing or wrong in Store settings.",
      "A company needs an invoice in an entity name that differs from the order.",
      "An invoice was issued with the wrong customer, lines or amounts.",
      "A refund is requested before PayFast confirms it, or the amount differs from the order.",
      "Anyone asks to backdate, renumber, split or duplicate an invoice.",
    ],
  },
  {
    slug: "supplier-orders",
    title: "Supplier orders",
    owner: "Fulfilment",
    summary:
      "Place and track supplier orders for imported lines, record the supplier reference against every line and keep the 10–18 day promise honest when customs intervenes.",
    steps: [
      {
        title: "Find the imported lines",
        detail:
          "Each order line shows its supplier; open the product (/admin/products/[id]) to confirm the supplier connection, supplier SKU, shipsFrom and lead time. Pick local studio stock first and raise a supplier order only for the shortfall. Never order an imported piece for a size the customer did not choose.",
      },
      {
        title: "Decide the destination before ordering",
        detail:
          "Default supplier orders to the Rosebank studio at 18 Keyes Avenue, Johannesburg, so the piece can be quality-checked, gift-wrapped and re-labelled. Use direct-to-customer dispatch only where the supplier connection is explicitly set up for it, and never for a gift order that needs a note and house wrap.",
      },
      {
        title: "Place the order on the store account",
        detail:
          "Order through the supplier's portal or API — CJ, AliExpress, a local maker or the configured custom connection — matching supplier SKU and variant exactly. Use the store's trading details and account, never a staff member's personal account. For local makers, use the agreed purchase order or an email trail.",
      },
      {
        title: "Record the supplier reference on the line",
        detail:
          "In the line's fulfilment form on the order detail, enter the supplier order or PO reference and save; set the line to ORDERED. Supplier references and supplier cost are internal — never share them with the customer, print them on a label or paste them into customer chat.",
      },
      {
        title: "Move statuses only when events happen",
        detail:
          "PENDING means not placed, ORDERED means the PO is with the supplier, IN_TRANSIT means the supplier has dispatched, RECEIVED means it has arrived and passed QC at the studio, PACKED means it is in the customer parcel, and SHIPPED means it has been handed to the courier. A supplier's dispatch notice is not a courier handover.",
      },
      {
        title: "Watch the lead time",
        detail:
          "Store settings currently promise 2–5 days local and 10–18 days global. Diarise a day-3 and day-7 check on imports, look in the supplier portal every two business days, and chase any line past its maximum with the supplier reference ready. Update the line status as soon as the situation changes.",
      },
      {
        title: "Communicate customs delays proactively",
        detail:
          "If tracking shows a customs hold, or there is no movement for three business days past the promised window, contact the customer with the reason, a revised date from the courier and the option to wait or cancel under policy. Do not say “shipping soon”, and do not blame customs without a tracking event to quote.",
      },
      {
        title: "Do not surprise the customer with import charges",
        detail:
          "Unless finance has agreed otherwise in writing, the customer pays only the order total. If a courier demands duty or import VAT at the door, collect the receipt, escalate to finance and settle through the store account. Never ask the customer to pay cash and promise a reimbursement on the spot.",
      },
      {
        title: "Receive and inspect at the studio",
        detail:
          "Match the supplier reference, SKU, variant and quantity, then check quality before setting RECEIVED and packing as normal. If the wrong item, size or a damaged piece arrives, photograph it, raise the supplier claim and do not ship a substitute without the customer's agreement.",
      },
      {
        title: "Handle out-of-stock and price changes",
        detail:
          "If the supplier is out of stock, discontinues the line or raises the cost by more than 10%, tell the customer the same day with an alternative or refund path. Admin cannot partially cancel an order, so escalate before cancelling a multi-line order — cancellation restocks everything and releases the promo.",
      },
    ],
    why: "Imported lines carry the longest and least predictable lead time in the store. Accurate line statuses stop the team promising stock it does not have, supplier references are the only key to claims and refunds, and early customs communication prevents support escalations and chargebacks.",
    escalateIf: [
      "A supplier misses its maximum lead time by three business days.",
      "A customs hold lasts more than five business days or a courier demands payment.",
      "The supplier substitutes a SKU, size or colour, or raises the price by more than 10%.",
      "A customer wants to cancel an imported line after the supplier order was placed.",
      "Supplier credentials, account details or payment instructions change unexpectedly.",
    ],
  },
  {
    slug: "fraud-and-disputes",
    title: "Fraud and disputes",
    owner: "Finance",
    summary:
      "Defensive checks for high-value and mismatched orders, plus the evidence pack needed to answer a PayFast chargeback without exposing customer data.",
    steps: [
      {
        title: "Screen the paid queue daily",
        detail:
          "Look beyond the payment column. Prioritise totals of R5 000+, three or more units of a high-resale line such as watches or fragrance, first orders from new accounts, delivery addresses in a different province from the phone or billing details, PO boxes, freight forwarders and multiple orders from one email, phone or address in 24 hours.",
      },
      {
        title: "Confirm the money is real in PayFast",
        detail:
          "The PayFast transaction must be completed and its payment reference must match the order. A customer's screenshot, forwarded email or “paid” message is not proof. Demo orders move no money and must never be shipped as if paid. Marking an order paid in admin does not take payment.",
      },
      {
        title: "Call before packing a flagged order",
        detail:
          "For R5 000+ or flagged orders, call the number on the order and ask for the order number, the name on the order, the delivery suburb and one item in the order. Do not ask the caller to recite everything from the confirmation email, and never ask for ID copies, card numbers or bank passwords.",
      },
      {
        title: "Use a hold, not an accusation",
        detail:
          "If the phone is unanswered, email from the store inbox and hold the parcel. Two failed attempts in 24 hours go to finance. Record the time, number called and outcome in the finance evidence folder — never in customer-visible delivery notes, support chat or a group message.",
      },
      {
        title: "Check personal and delivery mismatches",
        detail:
          "Compare payer name with order name, phone area code with delivery province, and the email domain with the customer's history. A PO-box delivery, a freight forwarder or a request to change the address after payment all warrant a hold. Admin has no address editor, so escalate rather than relabelling.",
      },
      {
        title: "Look for velocity flags",
        detail:
          "Search /admin/orders by name, email and tracking, compare phone and address across orders, and look for several accounts on one phone or address. In PayFast, look for repeated failed attempts followed by a success. Verify by phone, and do not cancel a genuine repeat client just because they ordered twice.",
      },
      {
        title: "Act on confirmed fraud",
        detail:
          "Before dispatch, hold the parcel and cancel only with finance approval: cancellation restocks every item, releases the promo and cannot be undone. Refund in PayFast first, then set payment status to refunded when the money has actually moved. If it has already shipped, open a courier investigation and flag the transaction in PayFast; treat the stock as lost until the investigation closes.",
      },
      {
        title: "Build the chargeback pack early",
        detail:
          "Before the PayFast deadline, assemble the tax invoice (INV-...), order detail with payment reference and tracking, signed packing slip, courier label, handover scan, proof of delivery, the pack photo set and the customer's emails or chat. Save one PDF as LS-<order number>-dispute and submit through PayFast; keep the tone factual.",
      },
      {
        title: "Handle data the POPIA-safe way",
        detail:
          "Collect only what the check needs. Never copy ID numbers or card details into email, WhatsApp or shared drives, and share evidence only with PayFast, the courier or the owner. Keep tax records for five years, delete verification data that is no longer needed, and never discuss a customer's order in a group chat.",
      },
      {
        title: "Keep the checks defensive only",
        detail:
          "These checks protect the store; they are not a reason to treat anyone differently. Apply the same thresholds to every customer, never use race, gender, name, accent, neighbourhood or payment method as a red flag, and escalate when unsure. A held order can be released; a fraudulent shipment usually cannot be recovered.",
      },
    ],
    why: "A fraud loss is the order value plus courier cost, PayFast fees and replacement stock, and a chargeback is won or lost on contemporaneous evidence. Consistent, documented checks also protect genuine customers from being treated arbitrarily.",
    escalateIf: [
      "A R10 000+ order is flagged or the customer refuses a verification call.",
      "The delivery address changes after payment, or the order is going to a PO box or freight forwarder.",
      "The payer name, phone or email does not match the order and the customer cannot explain it.",
      "PayFast opens a dispute, or the courier cannot produce proof of delivery.",
      "Anyone asks you to skip these checks or ship before payment is confirmed.",
    ],
  },
];

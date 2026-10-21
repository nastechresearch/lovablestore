export const GUIDE_CATEGORIES = [
  {
    label: "Gift planning",
    blurb: "Choosing with context, not guesswork.",
  },
  {
    label: "Sizing & fit",
    blurb: "Measurements, conversions and the courage to ask.",
  },
  {
    label: "Care & keeping",
    blurb: "Making the good things last in the SA climate.",
  },
  {
    label: "Delivery & logistics",
    blurb: "Cutoffs, customs and parcels that run late.",
  },
  {
    label: "Business & invoices",
    blurb: "VAT paperwork, POPIA and company orders.",
  },
  {
    label: "Corporate gifting",
    blurb: "Bulk orders, budgets and lead times.",
  },
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number]["label"];

export type GuideSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type GuideFaq = {
  q: string;
  a: string;
};

export type GuideLink = {
  label: string;
  href: string;
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: GuideCategory;
  readingMinutes: number;
  updated: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  relatedLinks: GuideLink[];
};

export const GUIDES: Guide[] = [
  {
    slug: "gifting-etiquette-sa",
    title: "How to choose a gift in South Africa without the guesswork",
    excerpt:
      "A practical guide to gifting a partner, a colleague or an in-law, with rand budgets, cultural cues and the moments a note does the real work.",
    category: "Gift planning",
    readingMinutes: 8,
    updated: "2026-10-14",
    intro:
      "South African gifting runs on warmth, but it also runs on context: who the person is, how you know them and what the occasion actually calls for. A gift that lands is rarely the most expensive one in the room; it is the one that shows someone was paying attention. These are the working rules we use in the studio when a customer asks what to buy for a partner, a colleague or an in-law.",
    sections: [
      {
        heading: "Start with the relationship, not the price",
        body:
          "The safest first question is not what should I spend, but how close are we. A generous gesture between friends can feel like an obligation from an acquaintance, and an expensive gift can accidentally raise the stakes. Match the warmth of the gift to the warmth of the relationship, then let your budget decide the object.",
        bullets: [
          "Partner: choose for the person they are, not the person you would like them to be. If they have never worn jewellery, do not start with a ring; if they live in sneakers, a watch may sit in a drawer.",
          "Colleague: keep it consumable, useful or desk-friendly, and avoid scent, underwear or anything that comments on their appearance. The note matters more than the price.",
          "In-law: generous but not overly intimate. Fragrance, a good candle, homeware or a shared experience gives warmth without presuming a closeness you may not have yet.",
          "Group gift: confirm the recipient’s taste with someone who knows them, collect contributions quietly and send one card with everyone’s names.",
        ],
      },
      {
        heading: "What a gift should cost in rand",
        body:
          "There is no official etiquette committee, only social norms that shift with the relationship and the occasion. Treat these bands as guardrails rather than rules, and never spend money you would quietly resent. The right number is one you can give without expecting anything back.",
        bullets: [
          "R150–R350: office Secret Santa, a teacher’s thank-you, a neighbour’s housewarming. Small, thoughtful and easy to receive.",
          "R350–R750: a colleague’s birthday, a new baby, a close friend’s dinner. A candle, coffee, skincare or a well-chosen book.",
          "R750–R1,500: a partner’s birthday, an in-law’s milestone, a close friend’s wedding. Fragrance, leather, a watch or a gift box.",
          "R1,500–R3,000: a significant anniversary, a parent’s birthday, a group wedding contribution. Buy one considered piece rather than three filler ones.",
          "R3,000+: engagements, ten-year anniversaries and immediate-family milestones. At this level, fit and taste matter more than branding.",
          "Group gifts: divide the cost by contributors; R300 each from ten people buys a far better gift than R300 from one.",
        ],
      },
      {
        heading: "When a gift note matters most",
        body:
          "A note is not decoration; it is the part of the gift that explains why it exists. It matters most when the gift travels alone, couriered to a home or handed over by reception, because the recipient may not have you there to read the room. It also matters when the gift is shared, practical or impersonal, since the words are what make it personal.",
        bullets: [
          "Say who it is from and why this piece: one specific detail beats three adjectives.",
          "Keep it under about 60 words; a card that takes ten seconds to read is more likely to be kept.",
          "Never mention the price, the discount or the effort it took to find.",
          "For a colleague, keep the tone warm and professional; inside jokes that exclude the room are not a gift.",
          "For condolences, illness or a hard season, skip advice and say you are thinking of them.",
          "For corporate gifting, include the recipient’s name and the company name, but leave the sales pitch out.",
        ],
      },
      {
        heading: "Reading the occasion, not just the person",
        body:
          "A birthday asks for personality; a wedding asks for support; a condolence asks for restraint. The occasion tells you how public the gift should be and how much explanation it needs. When two occasions overlap, such as a work milestone and a personal loss, choose the quieter gesture and follow up later.",
        bullets: [
          "Wedding: check the registry first; a group gift or cash contribution is normal, but never treat it as a ticket price.",
          "New baby: ask what the parents actually need; clothes in three to six months and practical consumables often beat newborn sizes.",
          "Condolence: food, practical help or a quiet donation in their name; avoid novelty gifts and cheerful hampers.",
          "Work milestone: keep it team-wide and modest; singling one person out with a big gift can create politics.",
          "Religious or cultural occasions: ask about alcohol, food and imagery before choosing; a well-meant hamper can miss the mark.",
        ],
      },
      {
        heading: "South African specifics worth knowing",
        body:
          "There is no single South African etiquette, because families, faiths and regions hold different customs. The common thread is generosity with awareness: ask a relative when you are unsure, and do not make the recipient explain their culture at the moment of receiving. Practical considerations such as heat, load-shedding and delivery distance are part of the gift too.",
        bullets: [
          "Cash is a common and welcome wedding contribution in many families, but check the registry or ask a close relative first.",
          "Many households value gifts that are useful and shared rather than purely decorative; when in doubt, ask your partner or a relative.",
          "Unwrapping in front of others is common at family gatherings; if you are sending direct, tell the recipient in the note that an exchange is welcome.",
          "Heat and load-shedding affect food and candles; avoid gifts that need refrigeration or long storage unless the recipient can keep them.",
          "If the recipient lives in another province, factor in delivery time and heat; see our delivery guide before promising a date.",
        ],
      },
      {
        heading: "When to ask the studio",
        body:
          "If you know the person but not their size, scent or address, the studio can narrow the shortlist and check what can arrive in time. We can also tell you which pieces are local stock and which are imported, because that changes the cutoff. Ask before you order, not after.",
      },
    ],
    faq: [
      {
        q: "Is R500 enough for a colleague’s birthday?",
        a: "It depends on the office, but R150–R350 is typical for a Secret Santa and R350–R750 for a personal colleague gift. If the team is pooling money, join the group gift rather than matching a number you are uncomfortable with. The note and timing usually matter more than the extra rand.",
      },
      {
        q: "What should I buy my mother-in-law?",
        a: "Go for warmth without presumption: a fragrance she already wears, a good candle, homeware or an experience she can share. Ask your partner about allergies, scent preferences and family customs before buying anything intimate. If you are unsure, a curated gift box is easier to receive than a single high-stakes piece.",
      },
      {
        q: "Do I need to bring a gift to a South African wedding?",
        a: "A gift is customary, but it is not a ticket price and it does not need to match anyone else’s contribution. Check the registry first; group gifts and cash envelopes are both common. Give what you can comfortably afford and include a note with your names.",
      },
      {
        q: "What if I do not know their size or scent?",
        a: "Choose something adjustable or consumable such as a scarf, candle, coffee, grooming set or fragrance discovery set rather than guessing a fitted item. If you want to buy clothing or a watch, ask a friend or partner for a size or borrow a piece they already own. Our sizing guide explains how to measure at home.",
      },
    ],
    relatedLinks: [
      { label: "Find a gift in three questions", href: "/gift-finder" },
      { label: "Shop ready-to-give gifts", href: "/shop?category=Gifts" },
      { label: "Sizing without guessing", href: "/guides/sizing-without-guessing" },
      { label: "Talk to the studio", href: "/contact" },
    ],
  },
  {
    slug: "sizing-without-guessing",
    title: "Sizing without guessing: clothes, shoes and rings",
    excerpt:
      "How to measure at home, translate SA, UK and EU labels and choose a size you can stand behind, even when the piece is a surprise.",
    category: "Sizing & fit",
    readingMinutes: 7,
    updated: "2026-10-12",
    intro:
      "South African clothing labels usually follow UK sizing, but the cut, fabric and brand can move a medium by several centimetres. The reliable route is to measure the person or a piece they already wear, then compare that number to the specific product’s size chart. If the gift is a surprise, choose something adjustable or build in an exchange before you buy.",
    sections: [
      {
        heading: "Measure once, write it down",
        body:
          "Use a soft tailor’s tape and measure over light clothing, keeping the tape level and snug but not tight. Write everything in centimetres, because most size charts list both centimetres and inches and centimetres are easier to compare across brands. If you are measuring someone else, ask them to stand naturally rather than holding their breath.",
        bullets: [
          "Chest or bust: around the fullest part, under the arms and across the shoulder blades.",
          "Waist: at the narrowest point, usually just above the navel; for low-rise trousers, measure where the waistband sits.",
          "Hips: around the fullest part, about 20 cm below the waist, with feet together.",
          "Inseam: from the crotch seam to the ankle bone of a pair of trousers that already fit.",
          "Sleeve: from the shoulder seam to the wrist bone with the arm relaxed.",
          "Shoe: stand on a sheet of paper, mark heel and longest toe, and measure the distance; do it in the evening when feet are slightly larger.",
        ],
      },
      {
        heading: "SA, UK and EU: what the label usually means",
        body:
          "Women’s clothing in South Africa commonly follows UK sizing, while menswear suiting is usually quoted by chest measurement in inches. Shoes are the least consistent: adult SA sizes generally track UK, but EU conversion varies by brand and last. Always use the size chart on the product page as the final word, and treat the conversions below as a starting point.",
        bullets: [
          "Women’s clothing: SA/UK 8 is roughly EU 36; 10 is 38; 12 is 40; 14 is 42; 16 is 44. A fitted cut can run one size smaller than a relaxed one.",
          "Men’s jackets and suits: SA/UK 38 is roughly EU 48; 40 is 50; 42 is 52; 44 is 54. The SA/UK number is the chest in inches.",
          "Shoes: SA/UK 6 is roughly EU 39; 7 is 40; 8 is 42; 9 is 43; 10 is 44. Half sizes and width vary, so check the specific chart.",
          "Rings: UK letters and EU numbers measure different things. UK N is about a 54 mm inside circumference, P about 56 mm and R about 59 mm; EU sizing usually uses that circumference in millimetres.",
          "Children’s sizes are a separate chart; do not convert an adult size down.",
        ],
      },
      {
        heading: "Sizing a surprise",
        body:
          "If you cannot measure the person, borrow a piece that fits them well and measure it flat, or ask someone who shops with them. A watch, a scarf, a candle or a fragrance discovery set removes the sizing risk entirely, which is often the smarter luxury gift. If you do buy fitted clothing or shoes, keep the tags on and check the return window before the occasion.",
        bullets: [
          "Measure a favourite jacket, shirt or pair of trousers flat: chest, waist, hip and length are enough to compare with a size chart.",
          "For rings, borrow one they wear on the correct finger and measure its inside diameter; do not guess from a photo.",
          "For watches, wrist circumference and case diameter matter more than men’s or women’s labels; 36–40 mm is a versatile everyday size.",
          "Check the product page for final-sale or personalised pieces, which cannot be exchanged for sizing.",
          "If you are between sizes, choose the larger size for relaxed cuts and the smaller only when the chart says the fabric has stretch.",
        ],
      },
      {
        heading: "Fit details people forget",
        body:
          "Shoulders are the hardest part of a garment to alter, so get those right first; waist and hem can usually be taken in. Leather shoes relax with wear, while suede and patent tend to hold their shape, and a wide ring band fits tighter than a thin one. Small fit decisions make the difference between a gift that is worn weekly and one that stays in the cupboard.",
        bullets: [
          "Shoes: leave roughly a centimetre between the longest toe and the end of the shoe; try them with the socks they will wear.",
          "Rings: knuckles can be wider than the base of the finger; measure both and choose a size that passes the knuckle comfortably.",
          "Watches: a case wider than the wrist can overhang; check lug-to-lug length, not just diameter.",
          "Tailoring: a jacket can be taken in at the waist and shortened at the sleeve, but shoulders and armholes are expensive to change.",
          "Fabric: linen and cotton may shrink slightly in a hot wash; wool usually relaxes with wear.",
        ],
      },
      {
        heading: "If you are still unsure",
        body:
          "Send the studio the measurements and a link to the piece before you order, and we will compare them with the supplier’s chart. We can also tell you whether an exchange is realistic for that item and how long it would take. It is better to ask one question now than to arrange a return during the week of the birthday.",
      },
    ],
    faq: [
      {
        q: "Do South African sizes match UK sizes?",
        a: "Usually for women’s clothing, and often for men’s shoes, but not reliably across every brand. EU sizes are different, and a relaxed cut can fit like the next size up. Always compare your measurements with the specific product’s chart rather than the label alone.",
      },
      {
        q: "How do I measure my ring size at home?",
        a: "Wrap a strip of paper or string around the base of the finger, mark where it overlaps and measure the length in millimetres; that is the circumference. Measure at room temperature, and if the band is wide, go up about half a size. An existing ring measured across the inside is more accurate if you have one.",
      },
      {
        q: "What if the size is wrong when the gift is opened?",
        a: "Eligible unworn pieces can be returned within 30 days with tags attached, and exchanges depend on stock. Contact the studio before sending anything back so we can reserve the replacement where possible. Personalised and final-sale pieces are excluded unless faulty.",
      },
      {
        q: "Should I size up in shoes?",
        a: "Measure the foot in centimetres and compare it with the shoe’s internal length, leaving about a centimetre at the toe. Leather may give slightly, but a shoe that pinches across the width rarely fixes itself. If the person is between sizes or has wide feet, ask the studio about the specific last.",
      },
    ],
    relatedLinks: [
      { label: "Ask the studio for a size check", href: "/contact" },
      { label: "Delivery & returns", href: "/delivery-and-returns" },
      { label: "Shop shoes", href: "/shop?category=Shoes" },
      { label: "Shop watches", href: "/shop?category=Watches" },
    ],
  },
  {
    slug: "care-for-watches-and-fragrance",
    title: "Care for watches, plated jewellery and fragrance in the SA climate",
    excerpt:
      "Practical storage and cleaning routines for the pieces you want to keep, built for Highveld sun, coastal humidity and everything in between.",
    category: "Care & keeping",
    readingMinutes: 9,
    updated: "2026-10-10",
    intro:
      "Highveld sun, coastal humidity and December heat are hard on the pieces people keep for years. Most damage is not dramatic; it is the slow work of perfume, steam, sunlight and a drawer that is too warm. A few small habits, and the right storage spot, will do more than any expensive care product.",
    sections: [
      {
        heading: "Watches: the habits that matter",
        body:
          "A water-resistance rating is a starting point, not a permanent guarantee: gaskets age, seals dry out and a watch that was fine in the pool last summer may not be this summer. Avoid pressing pushers or pulling the crown while the watch is wet, and screw the crown back down before you wash your hands. Heat and rapid temperature changes are harder on a watch than plain water.",
        bullets: [
          "3 ATM is for splashes and rain; 5 ATM for light swimming; 10 ATM or more for swimming and snorkelling. Never dive with a watch unless it is rated for diving.",
          "Rinse with fresh water after sea or chlorine, then dry with a soft cloth; salt and chlorine linger in bracelets and clasps.",
          "Keep mechanical watches away from strong magnets; laptop speakers, tablet covers and some handbag clasps can make them run fast.",
          "Service a mechanical watch every four to seven years, or as the brand recommends; replace a quartz battery every two to three years before it leaks.",
          "Store on a dry shelf, not in the bathroom; leather straps need air, so avoid sealing them in plastic.",
          "If the crystal fogs after a shower or swim, have the watch checked by a jeweller; do not open the case at home.",
        ],
      },
      {
        heading: "Plated jewellery: last on, first off",
        body:
          "Gold plating is a thin layer over brass, copper or stainless steel, and it wears with friction, sweat and chemicals. The simplest rule is last on, first off: apply perfume, moisturiser and sunscreen, then put the jewellery on, and take it off before you shower, swim or clean. Wipe each piece with a dry soft cloth after wearing and store it separately so chains do not rub against each other.",
        bullets: [
          "Keep plated pieces away from chlorine, salt water, hairspray, perfume and household cleaners.",
          "Remove rings and bracelets before the gym, gardening or washing dishes; sweat and abrasion thin the plating fastest.",
          "Do not use silver dip, ultrasonic cleaners or toothpaste on plated jewellery; they can strip the finish.",
          "Store in a dry pouch or a lined box, and add a silica packet to a humid drawer if needed.",
          "A jeweller can replate a favourite piece; this extends its life but does not make it solid gold.",
          "If your skin turns green, the base metal is reacting to acids in sweat; clean and dry the piece, and consider replating.",
        ],
      },
      {
        heading: "Fragrance: shelf life in SA heat",
        body:
          "An unopened bottle typically keeps for three to five years, while an opened bottle is usually best within 12 to 24 months. Citrus, aquatic and fresh notes fade first; richer amber, wood and spice bases tend to hold longer. Heat, light, oxygen and humidity speed up the change, so where you store the bottle matters more than the price on the label.",
        bullets: [
          "Keep the original box and store it in a dark, dry cupboard away from geysers, ovens and windows.",
          "The bathroom shelf is the worst place: steam and daily temperature swings degrade the juice and the label.",
          "Close the cap firmly, do not shake the bottle and avoid decanting into an open rollerball for long-term storage.",
          "Signs that a fragrance has turned: sour or acetone top notes, a darker colour or noticeably weaker projection.",
          "Travel with the bottle wrapped and upright; a hot car boot can do more damage in an afternoon than a year on a shelf.",
          "Concentration affects how long a scent wears on skin, not how long it keeps in the bottle.",
        ],
      },
      {
        heading: "Humidity, dust and the Highveld",
        body:
          "Coastal humidity can cloud plated pieces, soften leather straps and warp the cardboard around fragrance boxes, while Highveld dust settles into bracelet links and watch cases. A dry, shaded cupboard with a little airflow is better than a sealed display case in direct sun. If your cupboard feels damp, recharge a silica packet every few months or use a small dehumidifier.",
        bullets: [
          "Air leather straps and shoes overnight before storing; never put them away damp.",
          "Keep pieces out of direct sunlight; UV fades boxes, straps and some stones.",
          "Use a jewellery roll or individual pouches rather than a tangled box.",
          "Avoid storing fragrance or watches in a car, on a windowsill or above a fridge.",
          "In coastal KwaZulu-Natal and the Western Cape, check plated pieces monthly for tarnish and dry them immediately after wear.",
        ],
      },
      {
        heading: "A ten-minute seasonal reset",
        body:
          "Once a quarter, lay everything out, wipe it down and check the parts that fail silently: clasps, crown threads, strap stitching and ring settings. Replace a worn strap before it breaks, and book a watch service if it is losing time consistently. This is also the moment to pass on pieces you never wear, rather than storing them for another year.",
        bullets: [
          "Wipe metal with a dry microfibre cloth; use a barely damp cloth on solid gold or stainless steel only.",
          "Check that watch crowns screw down and that pins and clasps are secure.",
          "Smell each fragrance bottle and note the ones that have turned; use them up or replace them.",
          "Keep the care card with the piece so the next owner knows what it is.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I wear my watch in the shower?",
        a: "It depends on the rating, but steam and hot water are hard on gaskets even when a watch is water-resistant. A 3 ATM watch is splash-proof at best; a 10 ATM dive watch can handle swimming but not a steam room. Take it off for hot showers and saunas to prolong the seals.",
      },
      {
        q: "Why did my gold-plated ring turn my finger green?",
        a: "The base metal underneath the plating is reacting to acids in sweat, perfume or hand cream; it is usually harmless and washes off. Dry the ring and your hands, apply less product near the ring and consider having it replated. Solid gold or stainless steel is a better long-term choice if it keeps happening.",
      },
      {
        q: "How long does perfume last in Johannesburg heat?",
        a: "Unopened, most bottles keep for three to five years; once opened, aim to use them within 12 to 24 months. Johannesburg’s dry heat and strong sun are less forgiving than a cool cupboard, so keep the box closed and away from windows. Citrus notes will fade before the base notes do.",
      },
      {
        q: "Is it safe to store perfume in the bathroom?",
        a: "No: steam, humidity and temperature swings are the main enemies of fragrance. Move bottles to a dark, dry cupboard in a cooler room and keep the caps tight. If a bottle has turned cloudy or smells sour, replace it.",
      },
    ],
    relatedLinks: [
      { label: "Shop watches", href: "/shop?category=Watches" },
      { label: "Shop fragrance", href: "/shop?category=Fragrance" },
      { label: "Ask the studio about care", href: "/contact" },
      { label: "Returns & faulty pieces", href: "/delivery-and-returns" },
    ],
  },
  {
    slug: "delivery-timing-explained",
    title: "Delivery timing, explained: from checkout to your door",
    excerpt:
      "Cutoffs, business days, public holidays and customs: how we calculate your delivery window, and what to do when a parcel runs late.",
    category: "Delivery & logistics",
    readingMinutes: 7,
    updated: "2026-10-15",
    intro:
      "The delivery date on a product page is an estimate built from two things: when the parcel leaves us and how long the courier or customs takes after that. Understanding the cutoff and the difference between local and imported stock makes the window much easier to plan around. Here is how the maths works, and what to do if a parcel misses its estimate.",
    sections: [
      {
        heading: "The 14:00 SAST cutoff",
        body:
          "An order paid before 14:00 SAST on a business day is picked, packed and handed to the courier that same day. Orders paid after 14:00, or on a weekend or public holiday, start the process on the next business day. The clock starts when payment is confirmed, not when the order is placed, so a delayed instant EFT can push dispatch by a day.",
        bullets: [
          "SAST is UTC+2 all year; South Africa does not observe daylight saving, so the cutoff does not shift in summer.",
          "The cutoff applies to in-stock local pieces; imported stock has its own lead time before it can be packed.",
          "If you are paying by instant EFT, complete the payment in the same session rather than leaving the order pending.",
          "A Friday afternoon order will usually be dispatched on Monday, unless the Monday is a public holiday.",
        ],
      },
      {
        heading: "Business days and public holidays",
        body:
          "Business days are Monday to Friday, excluding South African public holidays; weekends and holidays are not counted in the transit window. Couriers often deliver on Saturdays in metro areas, but we do not count that Saturday as a business day. December is the busiest month of the year, so add a buffer for both courier volumes and public holidays.",
        bullets: [
          "Public holidays such as Heritage Day, Day of Reconciliation, Christmas Day and Day of Goodwill pause the count.",
          "When a public holiday falls on a Sunday, the following Monday is usually observed; the courier resumes on the next business day.",
          "Between mid-December and early January, allow an extra two to three business days for metro routes and longer for outlying areas.",
          "If your delivery address is outside a metro, the courier may need an extra day for the final leg.",
        ],
      },
      {
        heading: "Local parcels vs imported parcels",
        body:
          "Local stock is already in South Africa and usually arrives within two to five business days after dispatch, with no customs step. Global atelier pieces take roughly 10 to 18 business days because the window includes export handling, the flight into OR Tambo, customs clearance and the local last-mile courier. If your order mixes both, it may arrive in two parcels with two tracking numbers.",
        bullets: [
          "Local pieces ship from our Johannesburg studio; imported pieces ship from a vetted global partner.",
          "Customs clearance is included in the listed price and delivery estimate, but a request for information can pause the parcel.",
          "If SARS or the courier asks for documentation, respond the same day so the parcel does not sit in a warehouse.",
          "A mixed order is consolidated where possible, but one parcel can arrive a day or two before the other.",
        ],
      },
      {
        heading: "Reading the estimate correctly",
        body:
          "The dispatch date is when the parcel leaves the studio; the delivery window is when it should reach your address, not when it is ordered. Count only business days after dispatch, and remember that the first day in transit is often the day after handover. The tracking page is the most current source once the courier has scanned the parcel.",
        bullets: [
          "Order confirmation shows what was bought; the dispatch email shows when it left and the tracking number.",
          "A tracking status can stay unchanged for 24 to 48 hours while a parcel moves between depots; that is not necessarily a problem.",
          "Delivery attempts usually happen on business days; arrange for someone to be at the address or nominate a concierge.",
          "If you need a specific date, order local stock before the cutoff and leave at least two extra business days.",
        ],
      },
      {
        heading: "If your parcel is late",
        body:
          "Start with the tracking link, then allow one full business day after the latest estimate before worrying. Check with building reception, a neighbour or the security desk, because many late parcels have already been signed for. If there is still no movement, email the studio with your order number and tracking number and we will open a trace with the courier.",
        bullets: [
          "Include your order number, tracking number and the delivery address in the email.",
          "The courier usually responds to a trace within one to two business days.",
          "Keep the packaging until the parcel is confirmed, in case a damage claim is needed.",
          "If the parcel is declared lost, we will arrange a replacement or refund in line with our delivery policy.",
          "Do not wait a week to tell us; the sooner a trace is opened, the more likely the parcel is found.",
        ],
      },
      {
        heading: "Planning around a fixed date",
        body:
          "For a birthday, anniversary or corporate deadline, work backwards from the date rather than forwards from today. Choose local stock, order before 14:00 SAST and leave at least two buffer days; for imported pieces, add two weeks rather than two days. If the date is immovable, ask the studio before ordering and we will tell you honestly whether it can make it.",
      },
    ],
    faq: [
      {
        q: "Does the delivery estimate include weekends?",
        a: "No. The window counts business days, Monday to Friday, and skips South African public holidays. Couriers may deliver on a Saturday in metro areas, but we do not rely on that in the estimate.",
      },
      {
        q: "Why did my order arrive in two parcels?",
        a: "Orders that mix local and imported pieces can ship from different locations. We consolidate where possible, but customs clearance and stock availability can separate the parcels; each one gets its own tracking number.",
      },
      {
        q: "What happens if nobody is home?",
        a: "The courier will usually attempt delivery more than once, then return the parcel to us. A re-delivery fee may apply, so contact the studio as soon as you know you will miss it and we will try to rearrange the address or timing.",
      },
      {
        q: "My parcel is one day late. Should I worry?",
        a: "Check the tracking for a scan and allow one full business day after the latest estimate. If there is no movement, email the order and tracking numbers and we will open a trace. Most late parcels are found within one to two business days.",
      },
    ],
    relatedLinks: [
      { label: "Estimate a delivery date", href: "/tools/delivery-estimator" },
      { label: "Track an order", href: "/track" },
      { label: "Delivery & returns policy", href: "/delivery-and-returns" },
      { label: "Talk to the studio", href: "/contact" },
    ],
  },
  {
    slug: "tax-invoices-and-popia",
    title: "VAT invoices, company orders and POPIA requests",
    excerpt:
      "How to get a tax invoice finance will accept, how to fix order details, and how to access or export the personal information we hold.",
    category: "Business & invoices",
    readingMinutes: 7,
    updated: "2026-10-09",
    intro:
      "A company order often needs two things after checkout: a tax invoice that finance will accept and a clean record of who received what. This guide explains what appears on a Lovable Store invoice, how to correct billing details and how to exercise your rights under POPIA. It is practical information, not legal or tax advice.",
    sections: [
      {
        heading: "Getting a tax invoice for a company order",
        body:
          "Prices on the store include VAT at 15%, and every order has a Tax invoice link on its order page that you can print or save as a PDF. For company billing, email the studio with your order number, the company’s legal name, VAT registration number and billing address, and tell us if a purchase order number must appear. Do this before checkout if possible, so the details are correct from the start.",
        bullets: [
          "Include the order number (LS-…) in the subject line.",
          "Use the company’s registered legal name, not a trading name, unless both are required.",
          "Add the VAT number exactly as it appears on the company’s VAT certificate.",
          "Give a billing address, which may differ from the delivery address.",
          "Send the purchase order number if your finance team needs it on the invoice.",
        ],
      },
      {
        heading: "What appears on the invoice",
        body:
          "A full South African tax invoice needs enough detail for the recipient to claim input VAT and for the supplier’s records to match. Our invoices are generated from the order and include the supplier and recipient details, a unique invoice number, the date, a description of the goods, the quantity, the amount excluding VAT, the VAT amount and the total. The words Tax Invoice appear prominently at the top.",
        bullets: [
          "Supplier: Lovable Store name, Johannesburg address, VAT registration number and contact email.",
          "Recipient: company legal name, billing address and VAT number where supplied.",
          "Invoice number starting INV-YYYY-, followed by the order number.",
          "Line items with description, quantity, unit price and line total.",
          "Subtotal excluding VAT, VAT at 15% and the total including VAT in rand.",
          "Payment date and order reference, plus the PO number when provided.",
        ],
      },
      {
        heading: "Correcting details after the order",
        body:
          "If a name, VAT number or address is wrong, email the studio with the order number and the corrected details; we can reissue the PDF from the order record. For a change that affects the VAT amount, keep both versions and give the corrected one to your accountant. Update your account profile as well so the next order starts with the right information.",
        bullets: [
          "Check the company name against the VAT certificate before you send it.",
          "A delivery address change does not automatically change the billing address; ask for both if needed.",
          "If the invoice has already been filed, ask your accountant how to handle the correction before submitting it.",
          "The invoice date reflects the order or payment date; mention it if finance needs a statement for a different period.",
        ],
      },
      {
        heading: "POPIA: access, correction and export",
        body:
          "Under POPIA you can ask what personal information we hold, request a copy, correct it, ask us to delete it where we no longer have a lawful reason to keep it, or object to processing. Email our Information Officer at hello@lovablestore.co.za with your full name, the email used on the order and the action you want. We verify identity before releasing information and respond within 30 days.",
        bullets: [
          "Access: a copy of your account details, order history, delivery addresses and support messages.",
          "Correction: fix a name, email, phone number or address; order records may retain the address used at the time for tax purposes.",
          "Export: ask for a PDF or CSV summary of the information linked to your account.",
          "Deletion: we remove what we can, but tax and accounting records are kept for at least five years.",
          "Marketing: unsubscribe from any email or ask us to withdraw consent; transactional emails about an active order will still be sent.",
          "Complaints: if we cannot resolve it, you may contact the Information Regulator of South Africa.",
        ],
      },
      {
        heading: "Recipient data in corporate gifting",
        body:
          "If you are sending gifts to employees or clients, share only the information needed to deliver: name, delivery address, contact number and gift message. You remain responsible for having a lawful basis to share that information with us, and we pass only the necessary delivery details to the courier or supplier. Do not send ID numbers, medical information or personal notes that are not needed for the gift.",
      },
      {
        heading: "When to ask",
        body:
          "Send invoice and POPIA requests to the studio rather than to a courier or supplier, because we hold the order record and can verify the request. A single email with the order number, company details and the exact action required is faster than a chain of messages. If the request is urgent, mark it clearly in the subject line and follow up on WhatsApp if the studio has that channel enabled.",
      },
    ],
    faq: [
      {
        q: "How do I get a VAT invoice?",
        a: "Email hello@lovablestore.co.za with your order number, company legal name, VAT number, billing address and any PO number. We issue a PDF tax invoice from the order record, usually within one business day. Check the details before filing it with your accountant.",
      },
      {
        q: "Can you change the company name on an invoice after payment?",
        a: "Yes, if the order record supports the correction; we reissue the PDF with the corrected recipient details. If the VAT amount changes, keep both versions and ask your accountant how to treat the correction. The invoice date stays linked to the original order and payment.",
      },
      {
        q: "What can I request under POPIA?",
        a: "You can ask for confirmation of what we hold, a copy or export of your information, correction of inaccurate details, deletion where lawful, and withdrawal of marketing consent. We verify your identity and respond within 30 days. Some order records must be retained for tax purposes.",
      },
      {
        q: "Do you store my card details?",
        a: "No. Payments are processed by PayFast, and we do not store card numbers on our servers. Our records contain your contact details, order contents, delivery address and payment status.",
      },
    ],
    relatedLinks: [
      { label: "Privacy & POPIA policy", href: "/privacy" },
      { label: "Contact the Information Officer", href: "/contact" },
      { label: "Corporate & bulk gifting", href: "/guides/corporate-and-bulk-gifting" },
      { label: "Track an order", href: "/track" },
    ],
  },
  {
    slug: "corporate-and-bulk-gifting",
    title: "Corporate and bulk gifting: a practical playbook",
    excerpt:
      "Lead times, per-head budgets, personalisation and consolidated delivery: how to run a client or staff gifting order without last-minute panic.",
    category: "Corporate gifting",
    readingMinutes: 8,
    updated: "2026-10-13",
    intro:
      "Bulk gifting rewards good planning: the pieces are chosen once, wrapped consistently and delivered on a date that matters. It also punishes vagueness, because every extra address, name and logo adds a step that cannot be rushed. This playbook covers the numbers to settle first, realistic lead times and how to keep personalisation from becoming a bottleneck.",
    sections: [
      {
        heading: "Settle three numbers first",
        body:
          "Before you look at products, agree the date the gifts must be in people’s hands, the number of recipients and the all-in budget per head. Add 10–15% for delivery, personalisation and replacements, then decide whether gifts go to one address or many. Put one person in charge of the brief so the studio is not reconciling three versions of the same list.",
        bullets: [
          "Date: the day the gift should arrive, not the day of the event.",
          "Headcount: include spare units for damaged or late additions.",
          "Budget: ask for an all-in figure including VAT, wrapping and delivery.",
          "Addresses: one consolidated delivery is cheaper and simpler than fifty individual couriers.",
          "Approver: one name for sign-off on the product, the note and the final list.",
        ],
      },
      {
        heading: "Lead times you can plan around",
        body:
          "As a working guide, allow five to seven business days for 10–25 local gifts, 10–15 business days for 25–100 and three to four weeks for 100+ or anything personalised or imported. December adds pressure, so aim to approve the brief by the end of November for mid-December delivery. These are planning estimates, not promises; the studio confirms the real dates in writing once stock and addresses are known.",
        bullets: [
          "10–25 gifts, local stock: about one week after final list and payment.",
          "25–100 gifts: two to three weeks, especially if gift notes are handwritten.",
          "100+ gifts or imported pieces: three to four weeks or more; book early.",
          "Personalisation: add three to five business days after proof approval.",
          "December: add at least a week to every estimate and confirm the courier cutoff.",
        ],
      },
      {
        heading: "Budget per head in rand",
        body:
          "A useful corporate gift does not need to be expensive, but it does need to feel considered at the price point. These bands are starting points for all-in budgeting; the final quote depends on the piece, the wrap and the delivery method. Be wary of squeezing a premium brand into a token budget by removing the presentation, because the unboxing is part of the gift.",
        bullets: [
          "R250–R500: conference giveaways, team tokens, Secret Santa — candles, notebooks, coffee, desk accessories.",
          "R500–R1,000: staff birthdays, client thank-yous — fragrance discovery sets, leather cardholders, curated gift boxes.",
          "R1,000–R2,000: senior staff and key clients — watches, signature fragrance, leather goods.",
          "R2,000–R4,000+: executive gifts, long-service awards, key account milestones — premium pieces with engraving and upgraded wrap.",
          "Add delivery: individual nationwide courier costs more per head than a consolidated delivery to one office.",
        ],
      },
      {
        heading: "Personalisation without bottlenecks",
        body:
          "Engraving, embossing and handwritten notes turn a good gift into a memorable one, but they also add a proofing step and a hard deadline. Collect names, spellings and addresses in one spreadsheet, lock the list five business days before dispatch and approve a sample before the full run. Personalised pieces are usually final sale, so the final list is the one that gets made.",
        bullets: [
          "Names and initials: confirm spelling and capitalisation; “Sam” and “SAM” are different instructions.",
          "Logo: send a vector file (SVG, EPS or PDF) and allow time for a proof; not every material takes a logo well.",
          "Notes: keep each message under 60 words and write it in the recipient’s language where appropriate.",
          "Packaging: branded ribbon or a printed card adds polish; confirm quantities before production.",
          "Data: collect only name, address, contact number and gift note, and delete the sheet when the project is done.",
        ],
      },
      {
        heading: "Consolidated or individual delivery",
        body:
          "A single delivery to your office is the most economical option, but someone still has to receive, sort and hand out the gifts. Individual delivery is more expensive and needs a clean address list, but it lands directly with remote staff or clients and feels more personal. Many companies split the difference: one consolidated delivery for the office and individual couriers for remote recipients.",
        bullets: [
          "Consolidated: one address, one tracking number, one delivery window; you handle internal distribution.",
          "Individual: one parcel per recipient, each tracked; allow extra days for outlying areas.",
          "Hybrid: consolidate the majority and send individual parcels to remote or senior recipients.",
          "Packing slips never show prices, and gift notes are enclosed separately.",
          "Flag recipients who need a call before delivery, such as security estates or office receptions.",
        ],
      },
      {
        heading: "When to contact the studio",
        body:
          "Contact the studio three to four weeks before a fixed date, or immediately if you are inside ten business days. Bring the date, headcount, budget per head, destination addresses and any personalisation or branding requirements. If you are collecting employee or client data, mention POPIA early so the list is handled correctly from the start.",
      },
    ],
    faq: [
      {
        q: "Do you offer corporate discounts?",
        a: "Pricing is quoted per brief, and larger or consolidated orders may benefit from better rates on the pieces, wrap and delivery. There is no published percentage, so send the date, headcount and budget and ask for an all-in quote. Compare the total landed cost, not just the unit price.",
      },
      {
        q: "Can you engrave our company logo?",
        a: "It depends on the material and the piece; leather, metal and glass can often be engraved or embossed, while delicate fabrics and plated surfaces may not suit it. Send a vector file and we will confirm what is possible, the minimum quantity and the proofing time. A sample should be approved before the full run.",
      },
      {
        q: "Can you deliver to individual home addresses?",
        a: "Yes, nationwide, with a separate tracking number for each parcel. Send a clean list with recipient name, address, contact number and gift note, and allow extra business days for outlying areas. We only use those details to deliver the gift.",
      },
      {
        q: "How late can I order for December?",
        a: "Aim to approve local-stock gifts by the first week of December and imported or personalised pieces by mid-November. Couriers and suppliers fill up quickly, so the studio will confirm a written cutoff for your specific order. If you are already inside two weeks of the date, contact us before assuming it can be done.",
      },
    ],
    relatedLinks: [
      { label: "Send a corporate brief", href: "/contact" },
      { label: "The custom atelier", href: "/studio" },
      { label: "VAT invoices & POPIA", href: "/guides/tax-invoices-and-popia" },
      { label: "Shop ready-to-give gifts", href: "/shop?category=Gifts" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

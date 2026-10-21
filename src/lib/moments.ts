export type MomentTone =
  | "heritage"
  | "gold"
  | "rose"
  | "sky"
  | "velvet"
  | "green"
  | "sunset";

type MomentDef = {
  slug: string;
  name: string;
  tag: string;
  blurb: string;
  idea: string;
  windowLabel: string;
  tone: MomentTone;
  leadDays: number;
  tailDays: number;
  datesFor: (year: number) => Date[];
};

export type Moment = {
  slug: string;
  name: string;
  tag: string;
  blurb: string;
  idea: string;
  windowLabel: string;
  tone: MomentTone;
  date: string;
  start: string;
  end: string;
  dateLabel: string;
  live: boolean;
  daysAway: number;
};

const DAY = 86_400_000;

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function fixed(month: number, day: number) {
  return (year: number) => [new Date(year, month - 1, day)];
}

function nthWeekday(month: number, weekday: number, n: number) {
  return (year: number) => {
    const first = new Date(year, month - 1, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return [new Date(year, month - 1, 1 + offset + (n - 1) * 7)];
  };
}

function lastWeekday(month: number, weekday: number) {
  return (year: number) => {
    const last = new Date(year, month, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return [new Date(year, month - 1, last.getDate() - offset)];
  };
}

function paydays(year: number): Date[] {
  return Array.from({ length: 12 }, (_, month) => {
    const last = new Date(year, month + 1, 0);
    const offset = (last.getDay() - 5 + 7) % 7;
    return new Date(year, month, last.getDate() - offset);
  });
}

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const DIWALI: Record<number, [number, number]> = {
  2026: [11, 8],
  2027: [10, 29],
  2028: [10, 17],
  2029: [11, 5],
  2030: [10, 26],
};

const DEFS: MomentDef[] = [
  {
    slug: "new-year",
    name: "New Year, new intentions",
    tag: "new-year",
    blurb: "A fresh calendar, a fresh signature. Start the year with something worth keeping.",
    idea: "A watch for the year ahead, or a scent that becomes their new signature.",
    windowLabel: "26 Dec – 6 Jan",
    tone: "gold",
    leadDays: 6,
    tailDays: 5,
    datesFor: fixed(1, 1),
  },
  {
    slug: "back-to-school",
    name: "Back to school",
    tag: "back-to-school",
    blurb: "New term, new rhythm. Easy pieces for early lectures and late libraries.",
    idea: "Under-R500 finds, a everyday watch and a bag-ready fragrance.",
    windowLabel: "Early January",
    tone: "sky",
    leadDays: 12,
    tailDays: 14,
    datesFor: fixed(1, 15),
  },
  {
    slug: "valentines",
    name: "Valentine's Day",
    tag: "valentines",
    blurb: "The love edit — for her, for him and for the two of you.",
    idea: "A piece they will wear long after the roses are gone.",
    windowLabel: "24 Jan – 14 Feb",
    tone: "rose",
    leadDays: 21,
    tailDays: 1,
    datesFor: fixed(2, 14),
  },
  {
    slug: "human-rights-day",
    name: "Human Rights Day",
    tag: "human-rights-day",
    blurb: "A long weekend built around what matters. Spend it well, and give with meaning.",
    idea: "Locally made pieces that carry a story and support South African hands.",
    windowLabel: "14 – 24 March",
    tone: "green",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(3, 21),
  },
  {
    slug: "easter",
    name: "Easter weekend",
    tag: "easter",
    blurb: "Family tables, road trips and a quiet reset. Gifts for the people you travel to.",
    idea: "Something small and considered for the family lunch, or a keepsake for a long weekend.",
    windowLabel: "The Easter long weekend",
    tone: "green",
    leadDays: 21,
    tailDays: 2,
    datesFor: (year) => [easterSunday(year)],
  },
  {
    slug: "freedom-day",
    name: "Freedom Day",
    tag: "freedom-day",
    blurb: "27 April. A day to remember how far we have come, and to celebrate the everyday.",
    idea: "Local-first gifts under R500 that celebrate South African craft.",
    windowLabel: "20 – 30 April",
    tone: "sunset",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(4, 27),
  },
  {
    slug: "workers-day",
    name: "Workers' Day",
    tag: "workers-day",
    blurb: "For the ones who build, carry and keep everything moving. A small thank you goes far.",
    idea: "A durable watch, a leather staple or a fragrance for the daily commute.",
    windowLabel: "24 April – 3 May",
    tone: "gold",
    leadDays: 7,
    tailDays: 2,
    datesFor: fixed(5, 1),
  },
  {
    slug: "mothers-day",
    name: "Mother's Day",
    tag: "mothers-day",
    blurb: "For the woman who holds the family calendar together. Give something she will actually use.",
    idea: "Fragrance, a soft slip dress or a personalised keepsake, wrapped by hand.",
    windowLabel: "The second Sunday in May",
    tone: "rose",
    leadDays: 21,
    tailDays: 1,
    datesFor: nthWeekday(5, 0, 2),
  },
  {
    slug: "africa-day",
    name: "Africa Day",
    tag: "africa-day",
    blurb: "One continent, endless references. Celebrate the makers and stories on our doorstep.",
    idea: "Local fashion, fragrance and gifts rooted in African creativity.",
    windowLabel: "18 – 27 May",
    tone: "sunset",
    leadDays: 7,
    tailDays: 2,
    datesFor: fixed(5, 25),
  },
  {
    slug: "youth-day",
    name: "Youth Day",
    tag: "youth-day",
    blurb: "16 June. For the bold, the curious and the ones just finding their style.",
    idea: "Easy, expressive pieces under R1000 — sneakers, shades and a first proper fragrance.",
    windowLabel: "9 – 19 June",
    tone: "sky",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(6, 16),
  },
  {
    slug: "fathers-day",
    name: "Father's Day",
    tag: "fathers-day",
    blurb: "For the quiet providers and the loudest braai masters. Give something built to last.",
    idea: "A classic watch, leather shoes or a clean everyday scent.",
    windowLabel: "The third Sunday in June",
    tone: "gold",
    leadDays: 21,
    tailDays: 1,
    datesFor: nthWeekday(6, 0, 3),
  },
  {
    slug: "mandela-day",
    name: "Mandela Day",
    tag: "mandela-day",
    blurb: "67 minutes of good. Shop local, give thoughtfully and make the day count.",
    idea: "Local makers, gift-ready pieces and a note that means something.",
    windowLabel: "11 – 21 July",
    tone: "heritage",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(7, 18),
  },
  {
    slug: "womens-day",
    name: "Women's Day",
    tag: "womens-day",
    blurb: "9 August. For the women who make it look effortless. Celebrate her properly.",
    idea: "Fragrance, fine jewellery-adjacent watches and a dress that feels like her.",
    windowLabel: "2 – 12 August",
    tone: "rose",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(8, 9),
  },
  {
    slug: "spring-day",
    name: "Spring has sprung",
    tag: "spring-day",
    blurb: "1 September. Warmer light, lighter layers and the first hint of summer.",
    idea: "Linen, light fragrance and colour that lifts the whole outfit.",
    windowLabel: "September",
    tone: "green",
    leadDays: 3,
    tailDays: 30,
    datesFor: fixed(9, 1),
  },
  {
    slug: "heritage-day",
    name: "Heritage & Braai Day",
    tag: "heritage-day",
    blurb: "24 September. Braai smoke, family tables and proudly South African craft.",
    idea: "Local-first gifts, leather, watches and a fragrance made in Cape Town.",
    windowLabel: "17 – 28 September",
    tone: "heritage",
    leadDays: 7,
    tailDays: 4,
    datesFor: fixed(9, 24),
  },
  {
    slug: "tourism-day",
    name: "World Tourism Day",
    tag: "tourism-day",
    blurb: "See your own country first. Pack light, travel well and bring something home.",
    idea: "Shoes for the road, a crossbody bag and a fragrance that travels.",
    windowLabel: "20 – 30 September",
    tone: "sky",
    leadDays: 7,
    tailDays: 3,
    datesFor: fixed(9, 27),
  },
  {
    slug: "matric-dance",
    name: "Matric dance season",
    tag: "matric-dance",
    blurb: "The photos last forever. Help them look like the version of themselves they have been imagining.",
    idea: "A statement watch, heeled shoes and a fragrance for the big entrance.",
    windowLabel: "September – November",
    tone: "velvet",
    leadDays: 0,
    tailDays: 90,
    datesFor: fixed(9, 1),
  },
  {
    slug: "lobola",
    name: "Lobola & wedding season",
    tag: "lobola",
    blurb: "From umembeso to the first dance, celebrate the families coming together.",
    idea: "Couples' gifts, watches, fragrance and keepsakes for the wedding party.",
    windowLabel: "October – March",
    tone: "heritage",
    leadDays: 14,
    tailDays: 165,
    datesFor: fixed(10, 1),
  },
  {
    slug: "payday",
    name: "Payday",
    tag: "payday",
    blurb: "The last Friday of the month. A small reward for making it through.",
    idea: "Under-R1000 finds that feel like a treat without the guilt.",
    windowLabel: "The last Friday of every month",
    tone: "gold",
    leadDays: 3,
    tailDays: 7,
    datesFor: paydays,
  },
  {
    slug: "diwali",
    name: "Diwali",
    tag: "diwali",
    blurb: "The festival of lights. Gift something that glows long after the diyas are lit.",
    idea: "Fragrance, gifts and gold-toned watches for family visits.",
    windowLabel: "The festival of lights",
    tone: "gold",
    leadDays: 21,
    tailDays: 2,
    datesFor: (year) => {
      const date = DIWALI[year];
      return date ? [new Date(year, date[0] - 1, date[1])] : [];
    },
  },
  {
    slug: "black-friday",
    name: "Black Friday",
    tag: "black-friday",
    blurb: "One weekend, the year's best prices. Move early, because the good pieces go first.",
    idea: "Bestsellers, bundled gifts and the watches everyone has been watching.",
    windowLabel: "The last Friday in November",
    tone: "velvet",
    leadDays: 7,
    tailDays: 4,
    datesFor: lastWeekday(11, 5),
  },
  {
    slug: "christmas",
    name: "Christmas",
    tag: "christmas",
    blurb: "Trees up, lists out. Gifts that arrive wrapped and ready for the family table.",
    idea: "Gift-ready sets, fragrance and the pieces everyone asks about.",
    windowLabel: "10 November – 20 December",
    tone: "heritage",
    leadDays: 45,
    tailDays: 2,
    datesFor: fixed(12, 25),
  },
  {
    slug: "day-of-goodwill",
    name: "Day of Goodwill",
    tag: "day-of-goodwill",
    blurb: "26 December. The slowest, sweetest day of the year. Give something that lasts.",
    idea: "A keepsake for the person who hosted, or a gift to yourself for the year.",
    windowLabel: "22 – 28 December",
    tone: "gold",
    leadDays: 4,
    tailDays: 2,
    datesFor: fixed(12, 26),
  },
];

function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMomentCalendar(now = new Date()): {
  live: Moment[];
  upcoming: Moment[];
  all: Moment[];
} {
  const today = atMidnight(now);
  const found: Moment[] = [];
  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];

  for (const def of DEFS) {
    const windows = years.flatMap((year) =>
      def.datesFor(year).map((date) => {
        const start = new Date(atMidnight(date).getTime() - def.leadDays * DAY);
        const end = new Date(atMidnight(date).getTime() + def.tailDays * DAY);
        return { date: atMidnight(date), start, end };
      }),
    );

    const current = windows.find(
      (window) => window.start <= now && now <= window.end,
    );
    const chosen =
      current ??
      windows
        .filter((window) => window.start > now)
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    if (!chosen) continue;

    const live = Boolean(current);
    const daysAway = Math.max(
      0,
      Math.ceil((chosen.start.getTime() - now.getTime()) / DAY),
    );

    found.push({
      slug: def.slug,
      name: def.name,
      tag: def.tag,
      blurb: def.blurb,
      idea: def.idea,
      windowLabel: def.windowLabel,
      tone: def.tone,
      date: chosen.date.toISOString(),
      start: chosen.start.toISOString(),
      end: chosen.end.toISOString(),
      dateLabel: dateLabel(chosen.date),
      live,
      daysAway,
    });
  }

  const live = found
    .filter((moment) => moment.live)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = found
    .filter((moment) => !moment.live)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return { live, upcoming, all: [...live, ...upcoming] };
}

export const TONE_CLASSES: Record<MomentTone, { surface: string; ink: string; line: string; chip: string }> = {
  heritage: {
    surface: "bg-[#5b2a1e]",
    ink: "text-[#f7ead6]",
    line: "border-[#8a4a35]",
    chip: "bg-[#f0c987]/15 text-[#f0c987]",
  },
  gold: {
    surface: "bg-[#3f3320]",
    ink: "text-[#f8f0dd]",
    line: "border-[#7d6841]",
    chip: "bg-[#e8c98a]/15 text-[#e8c98a]",
  },
  rose: {
    surface: "bg-[#5a2634]",
    ink: "text-[#fbe9ea]",
    line: "border-[#8c4758]",
    chip: "bg-[#f4c2c9]/15 text-[#f4c2c9]",
  },
  sky: {
    surface: "bg-[#243a44]",
    ink: "text-[#eaf3f4]",
    line: "border-[#476470]",
    chip: "bg-[#b9dbe1]/15 text-[#b9dbe1]",
  },
  velvet: {
    surface: "bg-[#2c2233]",
    ink: "text-[#f2e9f2]",
    line: "border-[#57435f]",
    chip: "bg-[#d9bddf]/15 text-[#d9bddf]",
  },
  green: {
    surface: "bg-[#293a2e]",
    ink: "text-[#edf3e7]",
    line: "border-[#52684f]",
    chip: "bg-[#c4d7b4]/15 text-[#c4d7b4]",
  },
  sunset: {
    surface: "bg-[#4e3021]",
    ink: "text-[#fbefdf]",
    line: "border-[#85563b]",
    chip: "bg-[#f2c99c]/15 text-[#f2c99c]",
  },
};

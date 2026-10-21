const PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232", "2331112",
];

const START_B = 104;
const STOP = 106;

function encodeCode128B(value: string): string {
  const codes = [START_B];
  for (const character of value) {
    const code = character.charCodeAt(0);
    codes.push(code >= 32 && code <= 126 ? code - 32 : 0);
  }
  let checksum = START_B;
  for (let index = 1; index < codes.length; index += 1) {
    checksum += codes[index] * index;
  }
  codes.push(checksum % 103, STOP);
  return codes.map((code) => PATTERNS[code]).join("");
}

export function Barcode({
  value,
  height = 46,
  moduleWidth = 1.6,
  showValue = true,
  className,
}: {
  value: string;
  height?: number;
  moduleWidth?: number;
  showValue?: boolean;
  className?: string;
}) {
  const pattern = encodeCode128B(value);
  const width = pattern
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0) * moduleWidth;

  let cursor = 0;
  const bars: { x: number; width: number }[] = [];
  for (let index = 0; index < pattern.length; index += 1) {
    const span = Number(pattern[index]) * moduleWidth;
    if (index % 2 === 0) bars.push({ x: cursor, width: span });
    cursor += span;
  }

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`Barcode ${value}`}
        preserveAspectRatio="none"
        className="block"
      >
        {bars.map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="currentColor"
          />
        ))}
      </svg>
      {showValue ? (
        <figcaption className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.28em]">
          {value}
        </figcaption>
      ) : null}
    </figure>
  );
}

const tags = [
  "Peluquerías",
  "Barberías",
  "Estética",
  "Manicura",
  "Masajes",
  "Veterinarias",
  "Consultorios",
  "Hoteles",
  "Spa",
  "Dentistas",
  "Tatuadores",
];

export default function HeroStatsMarquee() {
  return (
    <div style={{ maxWidth: "520px" }}>
      <p
        className="uppercase text-gray-400 font-bold tracking-[1.5px] mb-[14px]"
        style={{ fontSize: "11px" }}
      >
       
        <strong className="font-extrabold text-gray-900"> en cualquier rubro, ahorrando tiempo y mejorando la experiencia de sus clientes.</strong>
      </p>

      <div
        className="overflow-hidden"
        aria-label="Industrias que usan SacaTurno"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        <div
          className="flex gap-[10px] w-max animate-ticker-scroll motion-reduce:animate-none hover:[animation-play-state:paused]"
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="py-[7px] px-[14px] rounded-full bg-[#fff1e8] border border-[rgba(221,73,36,0.18)] text-[#dd4924]   backdrop-blur-[6px] text-xs font-semibold  whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {tags.map((tag) => (
            <span
              key={`dup-${tag}`}
              aria-hidden="true"
              className="py-[7px] px-[14px] rounded-full border border-border text-orange-600 bg-orange-50 backdrop-blur-[6px] text-xs font-semibold  whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

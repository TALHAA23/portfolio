import site from "@/data/site.json";

export default function Marquee() {
  const row = [...site.marquee.items, ...site.marquee.items];
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-line py-5 md:py-6"
    >
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center font-display text-2xl font-bold uppercase tracking-tight md:text-4xl"
          >
            <span className={i % 2 ? "text-outline" : "text-faint"}>
              {item}
            </span>
            <span className="mx-8 text-sm text-accent md:mx-10">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

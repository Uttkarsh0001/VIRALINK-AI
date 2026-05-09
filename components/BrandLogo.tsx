import Link from "next/link";

type BrandLogoProps = {
  compact?: boolean;
  href?: string;
  subtitle?: boolean;
};

export default function BrandLogo({
  compact = false,
  href = "/dashboard",
  subtitle = true,
}: BrandLogoProps) {
  return (
    <Link href={href} className="inline-block">
      <div className="flex items-center gap-3 min-w-0">
        {!compact && (
          <div className="min-w-0">
            <p className="text-xl font-black tracking-tight whitespace-nowrap leading-none">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
                VIRALINK AI
              </span>
            </p>

            {subtitle && (
              <p className="text-xs text-white/45 whitespace-nowrap mt-1">
                Your Viral Content Weapon
              </p>
            )}
          </div>
        )}

        {compact && (
          <p className="text-lg font-black tracking-tight whitespace-nowrap leading-none">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
              VA
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
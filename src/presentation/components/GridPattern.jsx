import { useId } from 'react';

export default function GridPattern({
    width = 40, height = 40, x = -1, y = -1, strokeDasharray = "0", squares, className, ...props
}) {
    const id = useId();
    return (
        <svg aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full fill-slate-500/[0.04] stroke-slate-500/[0.08] ${className || ''}`} {...props}>
            <defs>
                <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([sqX, sqY]) => (
                        <rect strokeWidth="0" key={`${sqX}-${sqY}`} width={width - 1} height={height - 1} x={sqX * width + 1} y={sqY * height + 1} />
                    ))}
                </svg>
            )}
        </svg>
    );
}

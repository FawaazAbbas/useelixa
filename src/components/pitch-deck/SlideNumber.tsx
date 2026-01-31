interface SlideNumberProps {
  number: number;
  total?: number;
}

export const SlideNumber = ({ number, total = 13 }: SlideNumberProps) => {
  return (
    <div className="absolute bottom-6 left-6 z-20 print:hidden">
      <div className="flex items-baseline gap-1 text-slate-400">
        <span className="text-2xl font-bold text-slate-600">
          {String(number).padStart(2, "0")}
        </span>
        <span className="text-sm">/ {String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
};

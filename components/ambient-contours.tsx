type AmbientContoursProps = {
  className?: string;
};

export function AmbientContours({ className }: AmbientContoursProps) {
  return (
    <div className={className ? `contours ${className}` : "contours"} aria-hidden="true">
      <svg viewBox="0 0 800 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="contours-drift" stroke="currentColor" vectorEffect="non-scaling-stroke">
          <path
            d="M598 76C736 82 842 202 838 350C834 508 710 636 556 648C398 660 280 548 282 396C284 238 426 70 598 76Z"
            strokeWidth="0.8"
            opacity="0.34"
          />
          <path
            d="M596 124C714 129 798 230 795 352C792 482 690 590 558 600C424 610 330 518 332 394C334 262 452 119 596 124Z"
            strokeWidth="0.9"
            opacity="0.48"
          />
          <path
            d="M594 174C696 178 760 258 758 354C756 462 672 548 562 556C450 564 376 490 378 392C380 282 470 169 594 174Z"
            strokeWidth="1"
            opacity="0.62"
          />
          <path
            d="M592 222C674 226 724 286 722 358C720 442 654 508 566 514C476 520 420 462 422 388C424 300 492 218 592 222Z"
            strokeWidth="1.1"
            opacity="0.74"
          />
          <path
            d="M590 270C650 273 688 314 686 362C684 424 636 468 570 472C504 476 464 434 466 384C468 318 516 267 590 270Z"
            strokeWidth="1.2"
            opacity="0.86"
            strokeDasharray="3 5"
          />
          <path
            d="M-60 208C96 170 166 286 318 270C470 254 500 172 654 198C722 210 766 238 812 260"
            strokeWidth="0.7"
            opacity="0.26"
          />
          <path
            d="M-70 748C88 704 184 794 330 770C476 746 548 644 692 662C744 669 788 692 824 714"
            strokeWidth="0.7"
            opacity="0.22"
          />
          <path
            d="M760 34C742 118 766 168 742 238C722 296 700 318 704 386"
            strokeWidth="0.6"
            opacity="0.18"
          />
        </g>
      </svg>
    </div>
  );
}

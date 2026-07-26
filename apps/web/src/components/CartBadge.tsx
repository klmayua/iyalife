import { useStore } from "@nanostores/react";
import { cartCount } from "../stores/cart";

export default function CartBadge() {
  const count = useStore(cartCount);

  return (
    <a
      href="/cart"
      aria-label="View cart"
      className="relative flex items-center justify-center p-2 rounded-md
        text-brand-muted hover:text-brand-teal hover:bg-brand-teal/8 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center
            min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gold text-white
            text-[10px] font-bold leading-none"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}

import { atom, computed } from "nanostores";

export interface CartItem {
  id:       string;
  name:     string;
  price:    number;
  quantity: number;
  image?:   string;
  category: string;
  slug:     string;
}

const STORAGE_KEY = "iyalife-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── State ─────────────────────────────────────────────────────────────────────
export const cartItems = atom<CartItem[]>(loadCart());

if (typeof window !== "undefined") {
  cartItems.listen((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private browsing, quota exceeded) — fail silently.
    }
  });
}

export const cartCount = computed(
  cartItems,
  (items) => items.reduce((s, i) => s + i.quantity, 0),
);

export const cartTotal = computed(
  cartItems,
  (items) => items.reduce((s, i) => s + i.price * i.quantity, 0),
);

// ── Actions ───────────────────────────────────────────────────────────────────
export function addToCart(item: Omit<CartItem, "quantity">) {
  const current = cartItems.get();
  const existing = current.find((i) => i.id === item.id);
  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  } else {
    cartItems.set([...current, { ...item, quantity: 1 }]);
  }
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter((i) => i.id !== id));
}

export function updateQuantity(id: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(id);
  cartItems.set(
    cartItems.get().map((i) => (i.id === id ? { ...i, quantity } : i)),
  );
}

export function clearCart() {
  cartItems.set([]);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

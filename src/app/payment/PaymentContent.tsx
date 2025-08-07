/* ------------------------------------------------------------------
   src/app/payment/PaymentContent.tsx
   - Hiển thị giá / mã giảm / QR
   - Logic mới: nếu user đã trả tiền Knowdell thì Holland auto “paid”
------------------------------------------------------------------ */
"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { SERVICE } from "@/lib/constants";

const START_PATH: Record<keyof typeof SERVICE, string> = {
  mbti    : "/mbti/quiz",
  holland : "/holland/quiz",
  knowdell: "/knowdell",                // drag-drop ngay tại /knowdell
};

type Props = { product: keyof typeof SERVICE };

type Quote =
  | { error: string }
  | {
      listPrice : number;
      amount_due: number;
      discount  : number;
      amount    : number;
      paid?     : boolean;
    };

export default function PaymentContent({ product }: Props) {
  /* ------------------------------ state ------------------------------ */
  const [coupon,   setCoupon] = useState("");
  const [amount,   setAmount] = useState<number | null>(null);
  const [discount, setDisc]   = useState(0);
  const [qr,       setQr]     = useState<string | null>(null);
  const [error,    setErr]    = useState("");
  const [busy,     setBusy]   = useState(false);

  const destURL  = START_PATH[product] ?? `/${product}`;
  const onceFlag = useRef(false);               // auto-checkout đúng 1 lần

  /* --------------------------- utils --------------------------- */
  /** gọi quote 1 sản phẩm */
  async function fetchQuote(prod: string, code?: string): Promise<Quote> {
    const qs = new URLSearchParams({ product: prod, ts: Date.now().toString() });
    if (code) qs.append("coupon", code);
    return fetch(`/api/payments/quote?${qs}`, { cache: "no-store" }).then(r => r.json());
  }

  /** nếu X==holland & knowdell đã paid → redirect */
  async function maybeSkipForHolland() {
    if (product !== "holland") return false;
    const knowdell = await fetchQuote("knowdell");
    if ("paid" in knowdell && knowdell.paid) {
      // ghi “đã thanh toán” vào DB cho holland (1 request nhẹ, không blocking)
      fetch("/api/payments/checkout", {
        method : "POST",
        body   : JSON.stringify({ product: "holland", freeByBundle: true }),
        cache  : "no-store",
      }).finally(() => {
        window.location.replace(destURL);
      });
      return true;
    }
    return false;
  }

  /* ---------------------- 1. lấy quote đầu ---------------------- */
  useEffect(() => {
    (async () => {
      // 👉 nếu holland được bundle bởi knowdell
      if (await maybeSkipForHolland()) return;

      const res = await fetchQuote(product);
      if ("error" in res) { setAmount(-1); return; }

      setAmount(res.amount);
      setDisc  (res.discount);

      if (res.paid) {                       // đã ghi PAID
        window.location.replace(destURL);
      } else if (res.amount === 0 && !onceFlag.current) {
        onceFlag.current = true;
        doCheckout(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  /* ------------------- 2. polling khi có QR -------------------- */
  useEffect(() => {
    if (!qr) return;
    const id = setInterval(() => {
      fetch(`/api/payments/status?product=${product}`, { cache: "no-store" })
        .then(r => r.json())
        .then(res => { if (res.paid) window.location.replace(destURL); });
    }, 3000);
    return () => clearInterval(id);
  }, [qr, product, destURL]);

  /* -------------------- 3. áp mã giảm --------------------------- */
  async function applyCoupon() {
    setErr("");
    const code = coupon.trim();
    if (!code) return;
    const res = await fetchQuote(product, code);
    if ("error" in res) { setErr(res.error); return; }

    setAmount(res.amount);
    setDisc  (res.discount);

    if (res.amount === 0 && !onceFlag.current) {
      onceFlag.current = true;
      doCheckout(true);
    }
  }

  /* ---------------------- 4. checkout --------------------------- */
  async function doCheckout(auto = false) {
    if (busy) return;
    setBusy(true); setErr("");

    const body: Record<string, any> = { product, coupon: coupon.trim() || undefined };
    const res  = await fetch("/api/payments/checkout", {
      method: "POST",
      body  : JSON.stringify(body),
      cache : "no-store",
    }).then(r => r.json());

    setBusy(false);

    if (res.error) { setErr(res.error); return; }

    if (res.free) {
      window.location.replace(destURL);
      return;
    }
    if (!auto) {
      setQr(res.qr_url);
      setAmount(res.amount);
    }
  }

  /* ------------------------- render ----------------------------- */
  if (amount === null) return <p>Đang tải…</p>;
  if (amount === -1)   return <p className="text-red-600">Không lấy được giá.</p>;

  return (
    <div className="mx-auto max-w-sm space-y-6 text-center">
      <h2 className="mt-9 text-xl font-semibold">
        Thanh&nbsp;toán gói {product.toUpperCase()}
      </h2>

      <p>
        Phí cần trả:&nbsp;
        <b>{amount.toLocaleString("vi-VN")} đ</b>
        {discount > 0 && (
          <span className="text-sm text-green-600">
            &nbsp;(đã giảm {discount.toLocaleString("vi-VN")} đ)
          </span>
        )}
      </p>

      {/* coupon */}
      <div className="flex justify-center gap-2">
        <input
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          onKeyDown={(e: KeyboardEvent) => e.key === "Enter" && applyCoupon()}
          placeholder="Mã giảm giá"
          className="w-36 rounded border px-3 py-2 text-center"
        />
        <button
          onClick={applyCoupon}
          disabled={busy}
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
        >
          Áp dụng
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* QR hoặc nút */}
      {qr ? (
        <img
          src={qr}
          alt="QR thanh toán"
          className="mx-auto h-64 w-64 rounded border"
        />
      ) : (
        <button
          onClick={() => doCheckout(false)}
          disabled={busy}
          className="w-full rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {amount === 0
            ? "Xác nhận & kích hoạt"
            : `Thanh toán ${amount.toLocaleString("vi-VN")} đ`}
        </button>
      )}
    </div>
  );
}

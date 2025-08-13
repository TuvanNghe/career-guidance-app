/* ------------------------------------------------------------------ */
/*  /api/payments/quote      –  Tính số tiền phải trả + trạng thái     */
/* ------------------------------------------------------------------ */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/constants';

const PRICE = {
  mbti    : 0,          // MBTI luôn free
  holland : 20_000,
  knowdell: 100_000,    // giá gốc (có thể giảm thành combo)
  combo   : 90_000,     // Knowdell + Holland
} as const;

export async function GET(req: NextRequest) {
  /* 1. auth -------------------------------------------------------------- */
  const supa = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* 2. input ------------------------------------------------------------- */
  const product = (req.nextUrl.searchParams.get('product') ?? '')
    .toLowerCase() as keyof typeof PRICE;
  const rawCode = req.nextUrl.searchParams.get('coupon');      // có thể null

  if (!Object.hasOwn(PRICE, product)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  /* 3. Đã thanh toán gì trước đó? --------------------------------------- */
  const { data: paidRows } = await supa
    .from('payments')
    .select('product')
    .eq('user_id', user.id)
    .eq('status', STATUS.PAID);

  const paidSet = new Set<string>((paidRows ?? []).map((r) => r.product));

  /* rule bundle: Knowdell bao gồm Holland */
  const knowdellPaid = paidSet.has('knowdell');
  if (knowdellPaid) paidSet.add('holland');

  /* 4. Tính tiền gốc cần trả ------------------------------------------- */
  const listPrice = PRICE[product];

  /* combo giá “Knowdell nếu chưa có Holland” */
  let amount_due = listPrice;
  if (product === 'knowdell' && !paidSet.has('holland')) {
    amount_due = PRICE.combo;                  // 90 K cho cả 2 gói
  }

  /* Holland đã bao gồm trong Knowdell combo ⇒ 0 đ */
  if (product === 'holland' && knowdellPaid) {
    amount_due = 0;
  }

  /* 5. coupon (tùy chọn) ------------------------------------------------ */
  let discount = 0;
  if (rawCode?.trim()) {
    const code = rawCode.trim().toUpperCase();
    const { data: cpn } = await supa
      .from('coupons')
      .select('discount, product, expires_at')
      .eq('code', code)
      .maybeSingle();

    const now = new Date();
    const valid =
      cpn &&
      (!cpn.expires_at || new Date(cpn.expires_at) > now) &&
      (!cpn.product || cpn.product === product);

    if (valid) discount = cpn!.discount ?? 0;
  }

  const amount = Math.max(0, amount_due - discount);
  const paid   = paidSet.has(product);   // đã có record PAID ở DB hay bundle

  /* 6. response --------------------------------------------------------- */
  return NextResponse.json({
    listPrice,
    amount_due,
    discount,
    amount,
    paid,
  });
}

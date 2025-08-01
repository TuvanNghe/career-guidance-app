"use client";
export const dynamic = "force-dynamic";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

type Int = { interest_key: string; vi: string };
const LIMIT = 20;

export default function KnowdellInterests() {
  const supabase = createClientComponentClient();
  const router   = useRouter();

  const [list,   setList]   = useState<Int[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading,setLoading]= useState(false);

  useEffect(() => {
    supabase.from("lookup_interests").select("*").order("vi")
      .then(({ data }) => setList(data as Int[]));
  }, []);

  const toggle = (k:string)=>
    setPicked(p =>
      p.includes(k) ? p.filter(x=>x!==k)
      : p.length < LIMIT ? [...p,k]
      : p
    );

  async function finish() {
    if (picked.length !== LIMIT) return alert(`Chọn đủ ${LIMIT} nghề`);

    setLoading(true);
    const payload = {
      values:    JSON.parse(localStorage.getItem("kv_values") || "[]"),
      skills:    JSON.parse(localStorage.getItem("kv_skills") || "[]"),
      interests: picked
    };

    try {
      const res  = await fetch("/api/knowdell", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");

      localStorage.removeItem("kv_values");
      localStorage.removeItem("kv_skills");

      router.push("/profile");
    } catch (e:any) {
      alert(e.message || "Lỗi không rõ");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Chọn 20 nghề nghiệp bạn RẤT quan tâm</h1>
      <p className="text-sm text-gray-600">Đã chọn <b>{picked.length}</b>/{LIMIT}</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="border rounded p-3 h-[420px] overflow-y-auto space-y-1">
          {list.filter(i=>!picked.includes(i.interest_key)).map(i=>(
            <button key={i.interest_key}
              onClick={()=>toggle(i.interest_key)}
              disabled={picked.length===LIMIT}
              className="w-full text-left px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30">
              {i.vi}
            </button>
          ))}
        </div>

        <div className="border rounded p-3 h-[420px] overflow-y-auto space-y-1 bg-rose-50">
          {picked.map(k=>(
            <button key={k}
              onClick={()=>toggle(k)}
              className="w-full text-left px-3 py-1 rounded hover:bg-rose-100">
              {list.find(i=>i.interest_key===k)?.vi}
            </button>
          ))}
          {picked.length===0 && <p className="italic text-gray-500">Chưa chọn nghề nào</p>}
        </div>
      </div>

      <button onClick={finish}
        disabled={picked.length!==LIMIT || loading}
        className="mt-6 px-6 py-2 rounded bg-rose-600 text-white disabled:opacity-50">
        {loading ? "Đang lưu…" : "Hoàn tất"}
      </button>
    </div>
  );
}

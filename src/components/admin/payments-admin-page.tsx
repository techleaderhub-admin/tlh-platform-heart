import { useEffect, useMemo, useState } from "react";
import { CreditCard, Plus, RefreshCw, Save, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type Product={id:string;name:string;description:string|null;price:number;currency:string;membership_level:string|null;is_active:boolean};
type Payment={id:string;student_id:string;product_id:string|null;product_name:string;amount:number;currency:string;status:string;provider:string|null;external_transaction_id:string|null;paid_at:string|null;created_at:string};
type PaymentEvent={id:string;payment_id:string|null;event_type:string;status:string;provider:string;provider_event_id:string;error_message:string|null;processed_at:string|null;created_at:string};

const emptyProduct=()=>({name:"",description:"",price:"",currency:"INR",membership_level:"none",is_active:true});

export function PaymentsAdminPage(){
 const [products,setProducts]=useState<Product[]>([]);
 const [payments,setPayments]=useState<Payment[]>([]);
 const [students,setStudents]=useState<Record<string,string>>({});
 const [paymentEvents,setPaymentEvents]=useState<Record<string,PaymentEvent[]>>({});
 const [search,setSearch]=useState("");
 const [status,setStatus]=useState("all");
 const [product,setProduct]=useState(emptyProduct());
 const [message,setMessage]=useState("");
 const [saving,setSaving]=useState(false);

 const load=async()=>{
  const [ps,pm,profiles,events]=await Promise.all([
   supabase.from("payment_products").select("*").order("created_at",{ascending:false}),
   supabase.from("payments").select("*").order("created_at",{ascending:false}).limit(500),
   supabase.from("profiles").select("id,full_name"),
   supabase.from("payment_events").select("id,payment_id,event_type,status,provider,provider_event_id,error_message,processed_at,created_at").order("created_at",{ascending:false}).limit(1000),
  ]);
  setProducts((ps.data??[]) as Product[]);
  setPayments((pm.data??[]) as Payment[]);
  setStudents(Object.fromEntries((profiles.data??[]).map(p=>[p.id,p.full_name||"Unnamed leader"])));
  const grouped: Record<string,PaymentEvent[]> = {};
  for (const event of (events.data ?? []) as PaymentEvent[]) {
   if (!event.payment_id) continue;
   grouped[event.payment_id] = [...(grouped[event.payment_id] ?? []), event];
  }
  setPaymentEvents(grouped);
 };
 useEffect(()=>{void load();},[]);

 const filtered=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return payments.filter(p=>(status==="all"||p.status===status)&&(!q||[p.product_name,p.provider||"",p.external_transaction_id||"",students[p.student_id]||""].some(v=>v.toLowerCase().includes(q))));
 },[payments,search,status,students]);

 const saveProduct=async()=>{
  setSaving(true);setMessage("");
  const {error}=await supabase.from("payment_products").insert({
   name:product.name.trim(),description:product.description.trim()||null,price:Number(product.price),currency:product.currency,
   membership_level:product.membership_level==="none"?null:product.membership_level,is_active:product.is_active
  });
  setSaving(false);setMessage(error?error.message:"Product created.");if(!error){setProduct(emptyProduct());void load();}
 };

 return <AdminShell title="Payments & Automation" subtitle="Manage products, review payment records and let successful payments activate eligible memberships.">
  <div className="space-y-6">
   <div className="grid gap-4 sm:grid-cols-3">
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Products</p><p className="mt-1 text-2xl font-bold">{products.length}</p></CardContent></Card>
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Payment records</p><p className="mt-1 text-2xl font-bold">{payments.length}</p></CardContent></Card>
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Successful</p><p className="mt-1 text-2xl font-bold">{payments.filter(p=>["paid","completed","success"].includes(p.status)).length}</p></CardContent></Card>
   </div>

   <div className="grid gap-6 lg:grid-cols-[0.8fr_1.6fr]">
    <Card className="h-fit"><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="size-5"/>Product catalog</CardTitle></CardHeader><CardContent className="space-y-4">
     <label className="block space-y-2 text-sm font-medium">Product name<Input value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/></label>
     <label className="block space-y-2 text-sm font-medium">Description<Textarea rows={3} value={product.description} onChange={e=>setProduct({...product,description:e.target.value})}/></label>
     <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-sm font-medium">Price<Input type="number" min="0" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})}/></label><label className="space-y-2 text-sm font-medium">Currency<Input value={product.currency} onChange={e=>setProduct({...product,currency:e.target.value.toUpperCase()})}/></label></div>
     <label className="block space-y-2 text-sm font-medium">Successful payment grants<Select value={product.membership_level} onValueChange={v=>setProduct({...product,membership_level:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">No membership change</SelectItem><SelectItem value="l1">L1 Silver</SelectItem><SelectItem value="l2">L2 Gold</SelectItem><SelectItem value="l3">Diamond</SelectItem></SelectContent></Select></label>
     {message&&<p className="rounded-lg border bg-muted/30 p-3 text-sm">{message}</p>}
     <Button onClick={()=>void saveProduct()} disabled={saving||!product.name.trim()||!product.price}><Save/>{saving?"Saving…":"Create product"}</Button>
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5"/>Payment ledger</CardTitle></CardHeader><CardContent className="space-y-4">
     <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Leader, product, provider, transaction ID"/></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent></Select><Button variant="outline" onClick={()=>void load()}><RefreshCw/>Refresh</Button></div>
     {filtered.length===0?<p className="py-10 text-center text-sm text-muted-foreground">No payment records.</p>:<div className="space-y-2">{filtered.map(p=><div key={p.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{students[p.student_id]||"Unknown leader"}</p><p className="text-sm text-muted-foreground">{p.product_name} · {p.provider||"Manual"} · {p.external_transaction_id||"No external ID"}</p></div><Badge variant="outline">{p.status}</Badge></div><div className="mt-3 text-sm"><span className="font-medium">{p.currency} {p.amount}</span>{p.paid_at&&<span className="ml-3 text-muted-foreground">Paid {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeZone:"Asia/Kolkata"}).format(new Date(p.paid_at))}</span>}</div>{(paymentEvents[p.id]??[]).length>0&&<div className="mt-4 rounded-lg bg-muted/20 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event timeline</p><div className="mt-2 space-y-2">{(paymentEvents[p.id]??[]).map(event=><div key={event.id} className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-medium">{event.event_type}</span><span className="text-muted-foreground">{event.status} · {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"}).format(new Date(event.created_at))}</span>{event.error_message&&<span className="basis-full text-destructive">{event.error_message}</span>}</div>)}</div></div>}</div>)}</div>}
    </CardContent></Card>
   </div>
  </div>
 </AdminShell>;
}

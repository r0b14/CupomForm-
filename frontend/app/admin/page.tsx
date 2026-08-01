"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "participants"
  | "responses"
  | "campaign"
  | "coupons"
  | "deliveries"
  | "history";
type DeliveryStatus = "PENDING" | "DISPATCHED" | "SENT" | "FAILED";

type Participant = {
  id: number;
  name: string;
  phone: string;
  neighborhood: string;
  status: DeliveryStatus;
  date: string;
};

const participants: Participant[] = [
  { id: 1, name: "Maria Souza", phone: "(81) 91234-5678", neighborhood: "São José", status: "SENT", date: "30/07/2026" },
  { id: 2, name: "João Pedro", phone: "(81) 98877-1122", neighborhood: "Coelhos", status: "FAILED", date: "30/07/2026" },
  { id: 3, name: "Ana Beatriz", phone: "(81) 99911-2233", neighborhood: "Joana Bezerra", status: "DISPATCHED", date: "29/07/2026" },
  { id: 4, name: "Carlos Eduardo", phone: "(81) 97744-5566", neighborhood: "Boa Vista", status: "PENDING", date: "29/07/2026" },
  { id: 5, name: "Fernanda Lima", phone: "(81) 96633-8899", neighborhood: "Afogados", status: "SENT", date: "28/07/2026" },
  { id: 6, name: "Rafael Santos", phone: "(81) 95522-3344", neighborhood: "Madalena", status: "SENT", date: "28/07/2026" },
  { id: 7, name: "Juliana Alves", phone: "(81) 94411-7788", neighborhood: "Ilha do Retiro", status: "FAILED", date: "27/07/2026" },
  { id: 8, name: "Pedro Henrique", phone: "(81) 93300-9911", neighborhood: "São José", status: "DISPATCHED", date: "27/07/2026" },
  { id: 9, name: "Camila Rocha", phone: "(81) 92299-4455", neighborhood: "Coelhos", status: "PENDING", date: "26/07/2026" },
  { id: 10, name: "Bruno Costa", phone: "(81) 91188-6622", neighborhood: "Boa Vista", status: "SENT", date: "26/07/2026" },
];

const nav: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Painel geral", icon: "◫" },
  { id: "participants", label: "Participantes", icon: "◉" },
  { id: "responses", label: "Respostas", icon: "⌁" },
  { id: "campaign", label: "Campanha", icon: "✦" },
  { id: "coupons", label: "Cupons (CSV)", icon: "▣" },
  { id: "deliveries", label: "Envios", icon: "↗" },
  { id: "history", label: "Histórico", icon: "◷" },
];

const titles: Record<View, string> = {
  dashboard: "Painel geral",
  participants: "Participantes",
  responses: "Respostas e preenchimento",
  campaign: "Campanha",
  coupons: "Cupons (CSV)",
  deliveries: "Envios",
  history: "Histórico de ações",
};

const statusMeta: Record<DeliveryStatus, { label: string; classes: string }> = {
  PENDING: { label: "Pendente", classes: "bg-amber-100 text-amber-800" },
  DISPATCHED: { label: "Em envio", classes: "bg-indigo-100 text-indigo-800" },
  SENT: { label: "Enviado", classes: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Falhou", classes: "bg-red-100 text-red-800" },
};

const neighborhoods = ["São José", "Joana Bezerra", "Coelhos", "Boa Vista", "Afogados", "Madalena", "Ilha do Retiro"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#ebe9f5] bg-white p-5 shadow-[0_2px_10px_rgba(20,16,60,.05)] ${className}`}>{children}</section>;
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = statusMeta[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${meta.classes}`}>{meta.label}</span>;
}

function Metric({ label, value, tone = "indigo" }: { label: string; value: string | number; tone?: "indigo" | "emerald" | "amber" | "slate" }) {
  const colors = { indigo: "text-[#4338ca]", emerald: "text-[#059669]", amber: "text-[#b45309]", slate: "text-[#1b1830]" };
  return <Card><p className="text-xs font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{label}</p><p className={`mt-2 text-3xl font-extrabold ${colors[tone]}`}>{value}</p></Card>;
}

export default function AdminPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | DeliveryStatus>("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [campaignActive, setCampaignActive] = useState(true);
  const [title, setTitle] = useState("Sua trajetória importa");
  const [description, setDescription] = useState("Responda algumas perguntas sobre trabalho e território e ganhe um cupom para usar no comércio local.");
  const [saved, setSaved] = useState(false);
  const [couponQuery, setCouponQuery] = useState("");
  const [couponStatus, setCouponStatus] = useState("");

  const filteredParticipants = useMemo(() => participants.filter((participant) => {
    const haystack = `${participant.name} ${participant.phone}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!statusFilter || participant.status === statusFilter) && (!neighborhoodFilter || participant.neighborhood === neighborhoodFilter);
  }), [query, statusFilter, neighborhoodFilter]);

  const counts = useMemo(() => ({
    sent: participants.filter((p) => p.status === "SENT").length,
    pending: participants.filter((p) => p.status === "PENDING").length,
    failed: participants.filter((p) => p.status === "FAILED").length,
  }), []);

  function exportCsv() {
    const csv = ["nome,whatsapp,bairro,status,data", ...filteredParticipants.map((p) => [p.name, p.phone, p.neighborhood, statusMeta[p.status].label, p.date].map((value) => `\"${value}\"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "respostas-cupomform-demo.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function saveCampaign(event: FormEvent) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  if (!previewOpen) {
    return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#302b76_0%,#171545_42%,#0b0a1f_100%)] px-5 py-10">
      <section className="w-full max-w-[430px] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="grid size-14 place-items-center rounded-2xl bg-[#eceafc] text-2xl font-black text-[#4338ca]">C</div>
        <span className="mt-6 inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-800">Prévia de interface</span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1b1830]">Admin do CupomForm</h1>
        <p className="mt-3 text-sm leading-6 text-[#6b6785]">O backend atual não possui autenticação nem endpoints administrativos. Esta rota mostra o painel de referência com dados de demonstração, sem acessar dados reais.</p>
        <button type="button" onClick={() => setPreviewOpen(true)} className="mt-7 h-13 w-full rounded-xl bg-[#4338ca] px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-[#3730a3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4338ca]">Abrir prévia do painel</button>
        <a href="/" className="mt-3 flex h-11 items-center justify-center rounded-xl text-sm font-bold text-[#5c5878] hover:bg-[#f5f4fb]">Voltar ao formulário público</a>
      </section>
    </main>;
  }

  const coupons = Array.from({ length: 12 }, (_, index) => ({ code: `GD-000${123 + index}`, status: index % 3 === 0 || index === 2 || index === 9 ? "USADO" : "DISPONÍVEL", name: ["Maria Souza", "", "João Pedro", "", "Fernanda Lima", "", "Rafael Santos", "", "", "Bruno Costa", "", ""][index], date: ["30/07/2026", "", "30/07/2026", "", "28/07/2026", "", "28/07/2026", "", "", "26/07/2026", "", ""][index] })).filter((coupon) => (!couponQuery || `${coupon.code} ${coupon.name}`.toLowerCase().includes(couponQuery.toLowerCase())) && (!couponStatus || coupon.status === couponStatus));

  return <main className="min-h-screen bg-[#f8f7fc] text-[#1b1830]">
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-bold text-amber-900">Prévia local com dados fictícios — nenhuma ação desta tela altera a campanha ou envia cupons.</div>
    <div className="mx-auto flex min-h-[calc(100vh-39px)] max-w-[1600px] flex-col lg:flex-row">
      <aside className="shrink-0 bg-[#171545] px-4 py-6 lg:w-[250px] lg:px-5">
        <div className="flex items-center gap-3 px-2"><div className="grid size-10 place-items-center rounded-xl bg-white/12 text-lg font-black text-white">C</div><div><p className="font-extrabold text-white">Gente Daqui</p><p className="text-xs font-bold text-white/45">CupomForm Admin</p></div></div>
        <nav className="mt-7 flex gap-1 overflow-x-auto pb-1 lg:flex-col" aria-label="Navegação administrativa">{nav.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} className={`flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${view === item.id ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}`}><span className="grid size-5 place-items-center text-base" aria-hidden>{item.icon}</span>{item.label}</button>)}</nav>
        <div className="mt-8 hidden border-t border-white/10 pt-5 lg:block"><p className="px-3 text-xs font-bold leading-5 text-white/45">Integração administrativa pendente no backend.</p><button type="button" onClick={() => setPreviewOpen(false)} className="mt-4 flex h-10 w-full items-center rounded-xl px-3 text-sm font-bold text-white/65 hover:bg-white/8 hover:text-white">Sair da prévia</button></div>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#8b87a8]">Gente Daqui</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight">{titles[view]}</h1></div>{view === "participants" && <button type="button" onClick={exportCsv} className="h-10 rounded-xl bg-[#4338ca] px-4 text-sm font-extrabold text-white shadow-sm hover:bg-[#3730a3]">Exportar respostas (CSV)</button>}</header>
        {view === "dashboard" && <Dashboard counts={counts} />}
        {view === "participants" && <Participants query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} neighborhoodFilter={neighborhoodFilter} setNeighborhoodFilter={setNeighborhoodFilter} filtered={filteredParticipants} />}
        {view === "responses" && <Responses />}
        {view === "campaign" && <Campaign active={campaignActive} setActive={setCampaignActive} title={title} setTitle={setTitle} description={description} setDescription={setDescription} saved={saved} onSave={saveCampaign} />}
        {view === "coupons" && <Coupons coupons={coupons} query={couponQuery} setQuery={setCouponQuery} status={couponStatus} setStatus={setCouponStatus} />}
        {view === "deliveries" && <Deliveries participants={participants} counts={counts} />}
        {view === "history" && <History />}
      </div>
    </div>
  </main>;
}

function Dashboard({ counts }: { counts: { sent: number; pending: number; failed: number } }) {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Participantes" value="160" /><Metric label="Cupons disponíveis" value="340" tone="emerald" /><Metric label="Cupons utilizados" value="160" tone="indigo" /><Metric label="Envios com falha" value={counts.failed} tone="amber" /></div><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><Card><div className="flex items-center justify-between"><div><h2 className="font-extrabold">Evolução de respostas</h2><p className="mt-1 text-sm text-[#6b6785]">160 respostas concluídas nesta campanha</p></div><span className="rounded-full bg-[#eceafc] px-3 py-1 text-xs font-extrabold text-[#4338ca]">Últimos 30 dias</span></div><div className="mt-7 flex h-48 items-end gap-3 border-b border-[#ebe9f5] px-2">{[35, 48, 42, 67, 59, 78, 91, 72, 104, 112, 126, 148].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end"><div className="rounded-t-lg bg-[#6366f1] transition group-hover:bg-[#4338ca]" style={{ height: `${height}px` }} /><span className="mt-2 text-center text-[10px] font-bold text-[#8b87a8]">{index + 1}</span></div>)}</div></Card><Card><h2 className="font-extrabold">Status de envio</h2><div className="mt-6 grid place-items-center"><div className="grid size-40 place-items-center rounded-full" style={{ background: "conic-gradient(#059669 0 50%, #6366f1 50% 70%, #f59e0b 70% 85%, #dc2626 85% 100%)" }}><div className="grid size-28 place-items-center rounded-full bg-white text-center"><strong className="text-2xl font-extrabold">160</strong><span className="text-[11px] font-bold text-[#8b87a8]">cupons</span></div></div></div><div className="mt-6 grid grid-cols-2 gap-3 text-xs font-bold text-[#4b4768]"><span>● <b className="text-[#059669]">Enviados</b> {counts.sent}</span><span>● <b className="text-[#6366f1]">Em envio</b> 2</span><span>● <b className="text-amber-600">Pendentes</b> {counts.pending}</span><span>● <b className="text-red-600">Falhas</b> {counts.failed}</span></div></Card></div><Card><h2 className="font-extrabold">Participantes recentes</h2><div className="mt-4 overflow-x-auto"><ParticipantTable rows={participants.slice(0, 5)} /></div></Card></div>;
}

function Participants({ query, setQuery, statusFilter, setStatusFilter, neighborhoodFilter, setNeighborhoodFilter, filtered }: { query: string; setQuery: (value: string) => void; statusFilter: "" | DeliveryStatus; setStatusFilter: (value: "" | DeliveryStatus) => void; neighborhoodFilter: string; setNeighborhoodFilter: (value: string) => void; filtered: Participant[] }) {
  return <div className="space-y-5"><Card><div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr_.8fr]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou WhatsApp" className="h-11 rounded-xl border border-[#e7e5f0] px-3.5 text-sm outline-none ring-[#4338ca]/20 focus:ring-4" /><select value={neighborhoodFilter} onChange={(e) => setNeighborhoodFilter(e.target.value)} className="h-11 rounded-xl border border-[#e7e5f0] bg-white px-3 text-sm"><option value="">Todos os bairros</option>{neighborhoods.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | DeliveryStatus)} className="h-11 rounded-xl border border-[#e7e5f0] bg-white px-3 text-sm"><option value="">Todos os status</option>{Object.entries(statusMeta).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div></Card><Card className="overflow-hidden p-0"><div className="flex items-center justify-between px-5 py-4"><h2 className="font-extrabold">{filtered.length} participante{filtered.length === 1 ? "" : "s"}</h2><span className="text-xs font-bold text-[#8b87a8]">Dados demonstrativos</span></div><div className="overflow-x-auto"><ParticipantTable rows={filtered} /></div></Card></div>;
}

function ParticipantTable({ rows }: { rows: Participant[] }) {
  return <table className="w-full min-w-[680px] text-left"><thead className="border-y border-[#ebe9f5] bg-[#fbfaff]"><tr>{["Nome", "WhatsApp", "Bairro", "Status", "Data"].map((heading) => <th key={heading} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{heading}</th>)}</tr></thead><tbody>{rows.map((participant) => <tr key={participant.id} className="border-b border-[#f1eff8] last:border-0"><td className="px-5 py-4 text-sm font-extrabold">{participant.name}</td><td className="px-5 py-4 text-sm text-[#6b6785]">{participant.phone}</td><td className="px-5 py-4 text-sm text-[#6b6785]">{participant.neighborhood}</td><td className="px-5 py-4"><StatusBadge status={participant.status} /></td><td className="px-5 py-4 text-sm text-[#8b87a8]">{participant.date}</td></tr>)}</tbody></table>;
}

function Responses() {
  const funnel = [["Acessaram o formulário", 260, "#a5b4fc"], ["Concluíram identificação", 245, "#818cf8"], ["Concluíram trabalho/renda", 210, "#6366f1"], ["Concluíram território", 185, "#4f46e5"], ["Receberam cupom", 160, "#4338ca"]];
  const bars = [["Autônomo(a)/Freelancer", 30], ["Funcionário(a) CLT", 22], ["Empreendedor(a) informal", 20], ["Estudante", 18], ["Outro", 10]];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Iniciaram" value="260" /><Metric label="Concluíram" value="160" tone="emerald" /><Metric label="Taxa de conclusão" value="62%" tone="indigo" /></div><div className="grid gap-5 xl:grid-cols-2"><Card><h2 className="font-extrabold">Funil de preenchimento</h2><div className="mt-6 space-y-4">{funnel.map(([label, value, color]) => <div key={String(label)}><div className="mb-1.5 flex justify-between text-sm"><span className="font-bold text-[#4b4768]">{label}</span><strong>{value}</strong></div><div className="h-3 rounded-full bg-[#f0eff7]"><div className="h-full rounded-full" style={{ width: `${(Number(value) / 260) * 100}%`, background: String(color) }} /></div></div>)}</div></Card><Card><h2 className="font-extrabold">Profissão / atividade principal</h2><div className="mt-6 space-y-4">{bars.map(([label, value]) => <div key={String(label)} className="grid grid-cols-[minmax(145px,1fr)_2fr_40px] items-center gap-3 text-sm"><span className="font-bold text-[#4b4768]">{label}</span><div className="h-3 rounded-full bg-[#f0eff7]"><div className="h-full rounded-full bg-[#4338ca]" style={{ width: `${value}%` }} /></div><strong className="text-right">{value}%</strong></div>)}</div></Card></div></div>;
}

function Campaign({ active, setActive, title, setTitle, description, setDescription, saved, onSave }: { active: boolean; setActive: (value: boolean) => void; title: string; setTitle: (value: string) => void; description: string; setDescription: (value: string) => void; saved: boolean; onSave: (event: FormEvent) => void }) {
  const questions = ["Qual é a sua profissão ou principal atividade?", "Como é a sua renda hoje?", "Qual a maior barreira para você avançar hoje?", "Em qual bairro ou território você mora?", "Você conhece ou confia em alguma liderança comunitária do seu bairro?", "Você teria interesse em mentoria para crescer em uma área que gosta?"];
  return <form onSubmit={onSave}><Card className="max-w-4xl"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeaf7] pb-5"><div><h2 className="font-extrabold">Status da campanha</h2><p className="mt-1 text-sm text-[#6b6785]">A alteração é somente visual nesta prévia.</p></div><button type="button" role="switch" aria-checked={active} onClick={() => setActive(!active)} className={`relative h-7 w-12 rounded-full transition ${active ? "bg-[#059669]" : "bg-[#d8d5e8]"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${active ? "left-6" : "left-1"}`} /></button></div><div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-extrabold">Título da campanha<input value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 rounded-xl border border-[#e7e5f0] px-3.5 font-medium outline-none ring-[#4338ca]/20 focus:ring-4" /></label><label className="grid gap-2 text-sm font-extrabold">Descrição<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl border border-[#e7e5f0] px-3.5 py-3 font-medium outline-none ring-[#4338ca]/20 focus:ring-4" /></label><div><p className="text-sm font-extrabold">Perguntas da pesquisa</p><div className="mt-3 grid gap-2">{questions.map((question) => <div key={question} className="rounded-xl border border-[#e7e5f0] bg-[#fbfaff] px-3.5 py-3 text-sm font-bold text-[#4b4768]">{question}</div>)}</div></div><div className="flex items-center gap-4"><button className="h-12 rounded-xl bg-[#4338ca] px-5 text-sm font-extrabold text-white hover:bg-[#3730a3]">Salvar alterações</button>{saved && <span role="status" className="text-sm font-extrabold text-[#059669]">Alterações salvas apenas nesta sessão</span>}</div></div></Card></form>;
}

function Coupons({ coupons, query, setQuery, status, setStatus }: { coupons: { code: string; status: string; name: string; date: string }[]; query: string; setQuery: (value: string) => void; status: string; setStatus: (value: string) => void }) {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Disponíveis" value="340" tone="emerald" /><Metric label="Utilizados" value="160" /><Metric label="Lotes importados" value="1" tone="slate" /></div><Card><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-extrabold">Importar novo lote</h2><p className="mt-1 text-sm text-[#6b6785]">A importação depende do endpoint administrativo ainda não disponível.</p></div><button type="button" disabled className="h-11 rounded-xl bg-[#e7e5f0] px-4 text-sm font-extrabold text-[#8b87a8]">Selecionar CSV</button></div></Card><Card className="overflow-hidden p-0"><div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><h2 className="font-extrabold">Verificação de cupons</h2><div className="flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Código ou nome" className="h-10 rounded-xl border border-[#e7e5f0] px-3 text-sm" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-[#e7e5f0] bg-white px-2 text-sm"><option value="">Todos</option><option>USADO</option><option>DISPONÍVEL</option></select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="border-y border-[#ebe9f5] bg-[#fbfaff]"><tr>{["Código", "Status", "Usado por", "Data de uso"].map((heading) => <th key={heading} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{heading}</th>)}</tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.code} className="border-b border-[#f1eff8]"><td className="px-5 py-3.5 text-sm font-extrabold">{coupon.code}</td><td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${coupon.status === "USADO" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>{coupon.status === "USADO" ? "Usado" : "Disponível"}</span></td><td className="px-5 py-3.5 text-sm text-[#6b6785]">{coupon.name || "—"}</td><td className="px-5 py-3.5 text-sm text-[#8b87a8]">{coupon.date || "—"}</td></tr>)}</tbody></table></div></Card></div>;
}

function Deliveries({ participants, counts }: { participants: Participant[]; counts: { sent: number; pending: number; failed: number } }) {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Enviados" value={counts.sent} tone="emerald" /><Metric label="Pendentes" value={counts.pending} tone="amber" /><Metric label="Falhas" value={counts.failed} tone="slate" /></div><Card className="overflow-hidden p-0"><div className="px-5 py-4"><h2 className="font-extrabold">Solicitações de envio</h2><p className="mt-1 text-sm text-[#6b6785]">O reenvio manual requer uma rota administrativa segura.</p></div><div className="overflow-x-auto"><ParticipantTable rows={participants} /></div></Card></div>;
}

function History() {
  const items = [["30/07/2026 14:20", "Login realizado por admin@gentedaqui.org"], ["29/07/2026 10:05", "Campanha ativada"], ["22/07/2026 09:40", "Importados 200 cupons (lote_pernambuco_01.csv)"], ["21/07/2026 16:10", "Campanha criada"]];
  return <Card className="max-w-4xl p-0"><ol>{items.map(([date, action]) => <li key={String(date)} className="grid gap-1 border-b border-[#f1eff8] px-5 py-4 sm:grid-cols-[170px_1fr] sm:gap-5"><time className="text-xs font-extrabold text-[#8b87a8]">{date}</time><p className="text-sm font-bold text-[#4b4768]">{action}</p></li>)}</ol></Card>;
}

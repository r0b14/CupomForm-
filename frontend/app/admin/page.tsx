"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "participants"
  | "responses"
  | "campaign"
  | "coupons"
  | "deliveries"
  | "history";

type DeliveryStatus = "PENDING" | "DISPATCHED" | "SENT" | "FAILED";
type CouponStatus = "AVAILABLE" | "ASSIGNED";

type DashboardData = {
  campaign: { slug: string; title: string; active: boolean };
  submissions: number;
  coupons: { available: number; assigned: number };
  deliveries: Record<DeliveryStatus, number>;
};

type Participant = {
  id: string;
  name: string;
  phone: string;
  answers: Record<string, any> | null;
  createdAt: string;
  coupon: { code: string } | null;
  delivery: { status: DeliveryStatus; updatedAt: string } | null;
};

type ResponseQuestion = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  answered: number;
  distribution: { value: string; count: number; percentage: number }[];
};

type ResponsesData = {
  total: number;
  questions: ResponseQuestion[];
};

type CampaignData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  active: boolean;
  questions: { id: string; key: string; label: string; type: string; position: number }[];
};

type Coupon = {
  code: string;
  status: CouponStatus;
  campaignId: string;
  createdAt: string;
  submission: { name: string; createdAt: string } | null;
};

type DeliveryItem = {
  id: string;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  submission: {
    id: string;
    name: string;
    phone: string;
    coupon: { code: string } | null;
  };
};

type HistoryItem = {
  id: string;
  campaignId: string;
  action: string;
  metadata: Record<string, any> | null;
  createdAt: string;
};

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

function formatDate(dateStr?: string, includeTime = false): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (includeTime) {
      return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
    }
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function getNeighborhood(answers: any): string {
  if (!answers || typeof answers !== "object") return "—";
  return answers.bairro || answers.neighborhood || answers.Bairro || "—";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#ebe9f5] bg-white p-5 shadow-[0_2px_10px_rgba(20,16,60,.05)] ${className}`}>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = statusMeta[status] || { label: status, classes: "bg-slate-100 text-slate-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${meta.classes}`}>{meta.label}</span>;
}

function Metric({ label, value, tone = "indigo" }: { label: string; value: string | number; tone?: "indigo" | "emerald" | "amber" | "slate" }) {
  const colors = { indigo: "text-[#4338ca]", emerald: "text-[#059669]", amber: "text-[#b45309]", slate: "text-[#1b1830]" };
  return (
    <Card>
      <p className="text-xs font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${colors[tone]}`}>{value}</p>
    </Card>
  );
}

function LoadingState({ message = "Carregando dados..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-8 animate-spin rounded-full border-4 border-[#4338ca] border-t-transparent"></div>
      <p className="mt-4 text-sm font-bold text-[#6b6785]">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50/50 p-6 text-center">
      <p className="text-sm font-bold text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 h-10 rounded-xl bg-red-600 px-4 text-xs font-extrabold text-white hover:bg-red-700 transition"
      >
        Tentar novamente
      </button>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8d5e8] py-12 px-4 text-center">
      <p className="text-base font-extrabold text-[#1b1830]">{title}</p>
      <p className="mt-1 text-sm text-[#6b6785]">{description}</p>
    </div>
  );
}

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<"checking" | "unauthenticated" | "authenticated">("checking");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (data.authenticated) {
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch {
        setAuthStatus("unauthenticated");
      }
    }
    checkSession();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Falha ao realizar login.");
        return;
      }

      setAuthStatus("authenticated");
      setLoginPassword("");
    } catch {
      setLoginError("Erro de conexão ao tentar fazer login.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setAuthStatus("unauthenticated");
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#302b76_0%,#171545_42%,#0b0a1f_100%)] px-5 py-10">
        <LoadingState message="Verificando autenticação..." />
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#302b76_0%,#171545_42%,#0b0a1f_100%)] px-5 py-10">
        <section className="w-full max-w-[430px] rounded-3xl bg-white p-8 shadow-2xl">
          <div className="grid size-14 place-items-center rounded-2xl bg-[#eceafc] text-2xl font-black text-[#4338ca]">C</div>
          <span className="mt-6 inline-flex rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-extrabold text-[#4338ca]">Acesso restrito</span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1b1830]">Painel do CupomForm</h1>
          <p className="mt-2 text-sm leading-6 text-[#6b6785]">Informe a senha de administrador para acessar os dados da campanha e gerenciar envios.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#4b4768]">Senha do painel</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-2 h-12 w-full rounded-xl border border-[#e7e5f0] px-3.5 text-sm outline-none ring-[#4338ca]/20 focus:ring-4"
              />
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="h-13 w-full rounded-xl bg-[#4338ca] px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-[#3730a3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4338ca] disabled:opacity-50"
            >
              {loggingIn ? "Autenticando..." : "Entrar no painel"}
            </button>
          </form>

          <a href="/" className="mt-5 flex h-11 items-center justify-center rounded-xl text-sm font-bold text-[#5c5878] hover:bg-[#f5f4fb]">
            Voltar ao formulário público
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] text-[#1b1830]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="shrink-0 bg-[#171545] px-4 py-6 lg:w-[250px] lg:px-5">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-10 place-items-center rounded-xl bg-white/12 text-lg font-black text-white">C</div>
            <div>
              <p className="font-extrabold text-white">CupomForm</p>
              <p className="text-xs font-bold text-white/45">Administração</p>
            </div>
          </div>
          <nav className="mt-7 flex gap-1 overflow-x-auto pb-1 lg:flex-col" aria-label="Navegação administrativa">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${
                  view === item.id ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="grid size-5 place-items-center text-base" aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-bold text-white/80 transition hover:bg-red-600 hover:text-white"
            >
              Sair do painel
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-9">
          <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#8b87a8]">Painel Administrativo</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{titles[view]}</h1>
            </div>
          </header>

          {view === "dashboard" && <DashboardView />}
          {view === "participants" && <ParticipantsView />}
          {view === "responses" && <ResponsesView />}
          {view === "campaign" && <CampaignView />}
          {view === "coupons" && <CouponsView />}
          {view === "deliveries" && <DeliveriesView />}
          {view === "history" && <HistoryView />}
        </div>
      </div>
    </main>
  );
}

function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, partRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/participants"),
      ]);

      if (!dashRes.ok) throw new Error("Erro ao carregar métricas do painel.");
      const dashData = await dashRes.json();
      setData(dashData);

      if (partRes.ok) {
        const partData = await partRes.json();
        setRecentParticipants(Array.isArray(partData) ? partData.slice(0, 5) : []);
      }
    } catch (err: any) {
      setError(err.message || "Falha de conexão com a API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState message="Carregando métricas..." />;
  if (error || !data) return <ErrorState message={error || "Não foi possível carregar o dashboard."} onRetry={loadData} />;

  const sent = data.deliveries?.SENT || 0;
  const dispatched = data.deliveries?.DISPATCHED || 0;
  const pending = data.deliveries?.PENDING || 0;
  const failed = data.deliveries?.FAILED || 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Participantes" value={data.submissions} />
        <Metric label="Cupons disponíveis" value={data.coupons?.available ?? 0} tone="emerald" />
        <Metric label="Cupons utilizados" value={data.coupons?.assigned ?? 0} tone="indigo" />
        <Metric label="Envios com falha" value={failed} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">Campanha ativa</h2>
              <p className="mt-1 text-sm text-[#6b6785]">{data.campaign?.title || "Campanha sem título"}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${data.campaign?.active ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {data.campaign?.active ? "Ativa" : "Inativa"}
            </span>
          </div>
          <div className="mt-6 border-t border-[#ebe9f5] pt-4 space-y-2 text-sm text-[#4b4768]">
            <p><strong>Identificador:</strong> {data.campaign?.slug}</p>
            <p><strong>Total de submissões:</strong> {data.submissions}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-extrabold">Status de envio</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-[#4b4768]">
            <div className="rounded-xl bg-emerald-50 p-3">
              <span className="text-[#059669] uppercase tracking-wider block text-[10px]">Enviados</span>
              <strong className="text-xl font-extrabold text-[#059669]">{sent}</strong>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <span className="text-[#6366f1] uppercase tracking-wider block text-[10px]">Em envio</span>
              <strong className="text-xl font-extrabold text-[#6366f1]">{dispatched}</strong>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <span className="text-amber-600 uppercase tracking-wider block text-[10px]">Pendentes</span>
              <strong className="text-xl font-extrabold text-amber-600">{pending}</strong>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <span className="text-red-600 uppercase tracking-wider block text-[10px]">Falhas</span>
              <strong className="text-xl font-extrabold text-red-600">{failed}</strong>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-extrabold">Participantes recentes</h2>
        <div className="mt-4 overflow-x-auto">
          {recentParticipants.length > 0 ? (
            <ParticipantTable rows={recentParticipants} />
          ) : (
            <EmptyState title="Nenhum participante ainda" description="As respostas enviadas no formulário público aparecerão aqui." />
          )}
        </div>
      </Card>
    </div>
  );
}

function ParticipantsView() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | DeliveryStatus>("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadParticipants() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/participants?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar participantes.");
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Falha de conexão com a API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParticipants();
  }, [statusFilter]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadParticipants();
  }

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      const b = getNeighborhood(p.answers);
      if (b && b !== "—") set.add(b);
    });
    return Array.from(set).sort();
  }, [participants]);

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      if (!neighborhoodFilter) return true;
      return getNeighborhood(p.answers) === neighborhoodFilter;
    });
  }, [participants, neighborhoodFilter]);

  function handleExportCsv() {
    if (!filtered.length) return;

    const headers = ["Nome", "WhatsApp", "Bairro", "Status", "Cupom", "Data"];
    const rows = filtered.map((p) => [
      p.name,
      p.phone,
      getNeighborhood(p.answers),
      p.delivery?.status ? statusMeta[p.delivery.status]?.label || p.delivery.status : "Pendente",
      p.coupon?.code || "—",
      formatDate(p.createdAt),
    ]);

    const escapeCell = (val: string) => `"${String(val || "").replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participantes-cupomform-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={handleSearchSubmit} className="grid gap-3 lg:grid-cols-[1.2fr_.8fr_.8fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp..."
            className="h-11 rounded-xl border border-[#e7e5f0] px-3.5 text-sm outline-none ring-[#4338ca]/20 focus:ring-4"
          />
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="h-11 rounded-xl border border-[#e7e5f0] bg-white px-3 text-sm"
          >
            <option value="">Todos os bairros</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | DeliveryStatus)}
            className="h-11 rounded-xl border border-[#e7e5f0] bg-white px-3 text-sm"
          >
            <option value="">Todos os status</option>
            {Object.entries(statusMeta).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <button type="submit" className="h-11 rounded-xl bg-[#4338ca] px-4 text-sm font-extrabold text-white hover:bg-[#3730a3]">
            Buscar
          </button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-extrabold">{filtered.length} participante{filtered.length === 1 ? "" : "s"}</h2>
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-9 rounded-xl bg-[#4338ca] px-3.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#3730a3]"
            >
              Exportar respostas (CSV)
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState message="Carregando participantes..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadParticipants} />
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <ParticipantTable rows={filtered} />
          </div>
        ) : (
          <EmptyState title="Nenhum participante encontrado" description="Tente alterar os filtros de busca ou verifique se há respostas cadastradas." />
        )}
      </Card>
    </div>
  );
}

function ParticipantTable({ rows }: { rows: Participant[] }) {
  return (
    <table className="w-full min-w-[680px] text-left">
      <thead className="border-y border-[#ebe9f5] bg-[#fbfaff]">
        <tr>
          {["Nome", "WhatsApp", "Bairro", "Status", "Cupom", "Data"].map((heading) => (
            <th key={heading} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.id} className="border-b border-[#f1eff8] last:border-0 hover:bg-[#fbfaff]">
            <td className="px-5 py-4 text-sm font-extrabold">{p.name}</td>
            <td className="px-5 py-4 text-sm text-[#6b6785]">{p.phone}</td>
            <td className="px-5 py-4 text-sm text-[#6b6785]">{getNeighborhood(p.answers)}</td>
            <td className="px-5 py-4">
              <StatusBadge status={p.delivery?.status || "PENDING"} />
            </td>
            <td className="px-5 py-4 text-sm font-extrabold text-[#4338ca]">{p.coupon?.code || "—"}</td>
            <td className="px-5 py-4 text-sm text-[#8b87a8]">{formatDate(p.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResponsesView() {
  const [data, setData] = useState<ResponsesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadResponses() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/responses");
      if (!res.ok) throw new Error("Erro ao carregar estatísticas de respostas.");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResponses();
  }, []);

  if (loading) return <LoadingState message="Carregando estatísticas..." />;
  if (error || !data) return <ErrorState message={error || "Erro ao carregar respostas."} onRetry={loadResponses} />;

  return (
    <div className="space-y-5">
      <Metric label="Total de formulários concluídos" value={data.total} tone="emerald" />

      <div className="space-y-5">
        {data.questions.map((question) => (
          <Card key={question.key}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ebe9f5] pb-3">
              <h3 className="font-extrabold text-base text-[#1b1830]">{question.label}</h3>
              <span className="text-xs font-bold text-[#8b87a8]">
                {question.answered} de {data.total} responderam
              </span>
            </div>

            {question.distribution && question.distribution.length > 0 ? (
              <div className="mt-4 space-y-3">
                {question.distribution.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[minmax(145px,1fr)_2fr_60px] items-center gap-3 text-sm">
                    <span className="font-bold text-[#4b4768] truncate" title={item.value}>{item.value}</span>
                    <div className="h-3 rounded-full bg-[#f0eff7] overflow-hidden">
                      <div className="h-full rounded-full bg-[#4338ca]" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                    </div>
                    <strong className="text-right text-xs text-[#1b1830]">{item.percentage}% ({item.count})</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#8b87a8]">Nenhuma resposta registrada para esta pergunta ainda.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function CampaignView() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [active, setActive] = useState(true);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCampaign() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaign");
      if (!res.ok) throw new Error("Erro ao carregar dados da campanha.");
      const json: CampaignData = await res.json();
      setCampaign(json);
      setActive(json.active);
      setTitle(json.title || "");
      setSubtitle(json.subtitle || "");
    } catch (err: any) {
      setError(err.message || "Falha ao consultar campanha.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaign();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    try {
      const res = await fetch("/api/admin/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active, title, subtitle }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar campanha.");
      }

      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      loadCampaign();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Carregando campanha..." />;
  if (error || !campaign) return <ErrorState message={error || "Erro ao carregar dados."} onRetry={loadCampaign} />;

  return (
    <form onSubmit={handleSave}>
      <Card className="max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eeeaf7] pb-5">
          <div>
            <h2 className="font-extrabold text-lg">Status da campanha</h2>
            <p className="mt-1 text-sm text-[#6b6785]">Controle se o formulário público aceita novas respostas.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive(!active)}
            className={`relative h-7 w-12 rounded-full transition ${active ? "bg-[#059669]" : "bg-[#d8d5e8]"}`}
          >
            <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${active ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-extrabold">
            Título da campanha
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl border border-[#e7e5f0] px-3.5 font-medium outline-none ring-[#4338ca]/20 focus:ring-4"
            />
          </label>

          <label className="grid gap-2 text-sm font-extrabold">
            Subtítulo / Descrição
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              className="rounded-xl border border-[#e7e5f0] px-3.5 py-3 font-medium outline-none ring-[#4338ca]/20 focus:ring-4"
            />
          </label>

          <div>
            <p className="text-sm font-extrabold">Perguntas cadastradas ({campaign.questions?.length || 0})</p>
            <div className="mt-3 grid gap-2">
              {campaign.questions?.map((q) => (
                <div key={q.id} className="rounded-xl border border-[#e7e5f0] bg-[#fbfaff] px-3.5 py-3 text-sm font-bold text-[#4b4768]">
                  <span className="text-[#8b87a8] mr-2">#{q.position}</span> {q.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl bg-[#4338ca] px-5 text-sm font-extrabold text-white hover:bg-[#3730a3] disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            {savedMsg && <span role="status" className="text-sm font-extrabold text-[#059669]">Campanha atualizada com sucesso!</span>}
          </div>
        </div>
      </Card>
    </form>
  );
}

function CouponsView() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | CouponStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; ignored: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar cupons.");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Falha ao listar cupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, [status]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadCoupons();
  }

  async function submitImport(codes: string[]) {
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const res = await fetch("/api/admin/coupons/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao importar cupons.");

      setImportResult(data);
      setImportText("");
      loadCoupons();
    } catch (err: any) {
      setImportError(err.message || "Erro na importação.");
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const lines = content.split(/[\r\n,;]+/);
      const codes = lines
        .map((l) => l.replace(/^["']|["']$/g, "").trim())
        .filter((c) => c.length > 0 && !c.toLowerCase().includes("código") && !c.toLowerCase().includes("codigo"));
      
      if (codes.length === 0) {
        setImportError("Nenhum código válido encontrado no arquivo CSV.");
        return;
      }
      if (codes.length > 5000) {
        setImportError("O lote excede o limite máximo de 5.000 cupons por importação.");
        return;
      }

      submitImport(codes);
    };
    reader.readAsText(file);
  }

  function handleTextImport(e: FormEvent) {
    e.preventDefault();
    const codes = importText
      .split(/[\r\n,;]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (codes.length === 0) {
      setImportError("Insira pelo menos um código válido.");
      return;
    }
    if (codes.length > 5000) {
      setImportError("O lote excede o limite máximo de 5.000 cupons.");
      return;
    }

    submitImport(codes);
  }

  const availableCount = useMemo(() => coupons.filter((c) => c.status === "AVAILABLE").length, [coupons]);
  const assignedCount = useMemo(() => coupons.filter((c) => c.status === "ASSIGNED").length, [coupons]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Cupons na lista (Disponíveis)" value={availableCount} tone="emerald" />
        <Metric label="Cupons na lista (Atribuídos)" value={assignedCount} tone="indigo" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-extrabold">Importar novo lote de cupons</h2>
            <p className="mt-1 text-sm text-[#6b6785]">Selecione um arquivo CSV com a coluna de códigos ou cole uma lista.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="h-11 inline-flex items-center justify-center rounded-xl bg-[#4338ca] px-4 text-sm font-extrabold text-white cursor-pointer hover:bg-[#3730a3] transition">
              Selecionar CSV
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowImportModal(!showImportModal)}
              className="h-11 rounded-xl border border-[#e7e5f0] bg-white px-4 text-sm font-extrabold text-[#4b4768] hover:bg-[#f8f7fc]"
            >
              Colar códigos
            </button>
          </div>
        </div>

        {showImportModal && (
          <form onSubmit={handleTextImport} className="mt-4 border-t border-[#ebe9f5] pt-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b6785]">
              Cole os códigos (um por linha ou separados por vírgula)
            </label>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="CUPOM001&#10;CUPOM002&#10;CUPOM003"
              className="w-full rounded-xl border border-[#e7e5f0] p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#4338ca]"
            />
            <button
              type="submit"
              disabled={importing}
              className="h-10 rounded-xl bg-[#4338ca] px-4 text-xs font-extrabold text-white hover:bg-[#3730a3] disabled:opacity-50"
            >
              {importing ? "Enviando lote..." : "Enviar cupons"}
            </button>
          </form>
        )}

        {importResult && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold text-[#059669]">
            Lote processado! <strong>{importResult.inserted}</strong> cupons inseridos e <strong>{importResult.ignored}</strong> ignorados (duplicados ou já existentes).
          </div>
        )}

        {importError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-bold text-red-800">
            {importError}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <h2 className="font-extrabold">Verificação de cupons ({coupons.length})</h2>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código"
              className="h-10 rounded-xl border border-[#e7e5f0] px-3 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | CouponStatus)}
              className="h-10 rounded-xl border border-[#e7e5f0] bg-white px-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="AVAILABLE">Disponível</option>
              <option value="ASSIGNED">Utilizado/atribuído</option>
            </select>
            <button type="submit" className="h-10 rounded-xl bg-[#4338ca] px-3 text-xs font-extrabold text-white">
              Filtrar
            </button>
          </form>
        </div>

        {loading ? (
          <LoadingState message="Carregando cupons..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadCoupons} />
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="border-y border-[#ebe9f5] bg-[#fbfaff]">
                <tr>
                  {["Código", "Status", "Atribuído a", "Data"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className="border-b border-[#f1eff8] last:border-0 hover:bg-[#fbfaff]">
                    <td className="px-5 py-3.5 text-sm font-extrabold font-mono text-[#4338ca]">{c.code}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${c.status === "ASSIGNED" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {c.status === "ASSIGNED" ? "Utilizado/atribuído" : "Disponível"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#6b6785]">{c.submission?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8b87a8]">{formatDate(c.submission?.createdAt || c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhum cupom encontrado" description="Nenhum cupom atende aos critérios da busca." />
        )}
      </Card>
    </div>
  );
}

function DeliveriesView() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"" | DeliveryStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadDeliveries() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/deliveries?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar lista de envios.");
      const data = await res.json();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar envios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  async function handleResend(submissionId: string, participantName: string) {
    if (!confirm(`Deseja solicitar o reenvio do cupom para ${participantName}?`)) return;

    setResendingId(submissionId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/deliveries/${submissionId}/resend`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erro ao solicitar reenvio.");

      setActionMessage({ type: "success", text: `Reenvio solicitado com sucesso para ${participantName}!` });
      loadDeliveries();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Falha ao solicitar reenvio." });
    } finally {
      setResendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {actionMessage && (
        <div className={`rounded-xl p-4 text-sm font-bold ${actionMessage.type === "success" ? "bg-emerald-50 text-[#059669] border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {actionMessage.text}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <h2 className="font-extrabold">Solicitações de envio de WhatsApp ({deliveries.length})</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | DeliveryStatus)}
            className="h-10 rounded-xl border border-[#e7e5f0] bg-white px-3 text-sm"
          >
            <option value="">Todos os status</option>
            {Object.entries(statusMeta).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingState message="Carregando solicitações..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadDeliveries} />
        ) : deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-y border-[#ebe9f5] bg-[#fbfaff]">
                <tr>
                  {["Participante", "WhatsApp", "Cupom", "Status", "Atualizado em", "Ação"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-[#8b87a8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b border-[#f1eff8] last:border-0 hover:bg-[#fbfaff]">
                    <td className="px-5 py-4 text-sm font-extrabold">{d.submission?.name || "—"}</td>
                    <td className="px-5 py-4 text-sm text-[#6b6785]">{d.submission?.phone || "—"}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#4338ca]">{d.submission?.coupon?.code || "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-[#8b87a8]">{formatDate(d.updatedAt, true)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={resendingId === d.submission?.id}
                        onClick={() => handleResend(d.submission.id, d.submission.name)}
                        className="h-8 rounded-lg bg-[#4338ca] px-3 text-xs font-extrabold text-white hover:bg-[#3730a3] disabled:opacity-50"
                      >
                        {resendingId === d.submission?.id ? "Enviando..." : "Reenviar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhum envio registrado" description="Nenhuma solicitação de envio encontrada para os filtros selecionados." />
        )}
      </Card>
    </div>
  );
}

function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/history");
      if (!res.ok) throw new Error("Erro ao carregar histórico.");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Falha ao consultar histórico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) return <LoadingState message="Carregando histórico de auditoria..." />;
  if (error) return <ErrorState message={error} onRetry={loadHistory} />;

  return (
    <Card className="max-w-4xl p-0">
      {history.length > 0 ? (
        <ol className="divide-y divide-[#f1eff8]">
          {history.map((item) => (
            <li key={item.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
              <time className="text-xs font-extrabold text-[#8b87a8]">{formatDate(item.createdAt, true)}</time>
              <div>
                <p className="text-sm font-bold text-[#1b1830]">{item.action}</p>
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <pre className="mt-1 text-[11px] font-mono text-[#6b6785] bg-[#fbfaff] p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title="Histórico vazio" description="Nenhuma ação auditada registrada até o momento." />
      )}
    </Card>
  );
}

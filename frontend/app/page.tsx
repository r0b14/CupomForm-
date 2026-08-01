// Campaign form UI based on CupomForm.dc.html.
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Question = {
  key: string;
  label: string;
  type: "SINGLE_CHOICE" | "TEXT";
  required: boolean;
  options: string[] | null;
};

type Campaign = {
  slug: string;
  title: string;
  subtitle?: string | null;
  privacyText: string;
  questions: Question[];
};

type Result = { submissionId: string; couponCode: string; isExisting: boolean };
type FieldErrors = Record<string, string>;

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const questionPageSize = 3;
const previewCampaign: Campaign = {
  slug: "gente-daqui-preview",
  title: "Sua trajetória importa",
  subtitle:
    "Responda algumas perguntas sobre trabalho e território e ganhe um cupom para usar no comércio local.",
  privacyText:
    "Li e aceito que minhas respostas sejam usadas na pesquisa do projeto Gente Daqui e autorizo o uso dos meus dados para receber o cupom.",
  questions: [
    { key: "atividade", label: "Qual é a sua profissão ou principal atividade?", type: "SINGLE_CHOICE", required: true, options: ["Estudante", "Funcionário(a) CLT", "Autônomo(a)/Freelancer", "Empreendedor(a) informal", "Outro"] },
    { key: "renda", label: "Como é a sua renda hoje?", type: "SINGLE_CHOICE", required: true, options: ["Bicos ou trabalho por aplicativo", "Trabalho informal fixo", "Autônomo(a) ou MEI", "Emprego com carteira (CLT)", "Não estou trabalhando no momento"] },
    { key: "barreira", label: "Qual a maior barreira para você avançar hoje?", type: "SINGLE_CHOICE", required: true, options: ["Falta de renda para parar e estudar", "Falta de tempo", "Falta de rede de contatos", "Falta de confiança/segurança", "Documentação ou burocracia"] },
    { key: "bairro", label: "Em qual bairro ou território você mora?", type: "TEXT", required: true, options: null },
    { key: "lideranca", label: "Você conhece ou confia em alguma liderança comunitária do seu bairro?", type: "SINGLE_CHOICE", required: true, options: ["Sim, conheço e confio", "Conheço, mas não confio muito", "Não conheço nenhuma"] },
    { key: "mentoria", label: "Você teria interesse em mentoria para crescer em uma área que gosta?", type: "SINGLE_CHOICE", required: true, options: ["Sim, tenho muito interesse", "Talvez, quero saber mais", "Agora não tenho interesse"] },
  ],
};

function apiError(payload: unknown): string {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message: unknown }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }
  return "Não foi possível concluir agora. Tente novamente.";
}

function isSoldOut(message: string) {
  return /esgotaram|esgotado/i.test(message);
}

function ChoiceField({
  question,
  value,
  onChange,
  error,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[13.5px] font-extrabold leading-5 text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </legend>
      <div className="space-y-2.5">
        {question.options?.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-left text-[15px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4338ca] ${selected ? "border-[#4338ca] bg-[#eceafc]" : "border-[#e7e5f0] bg-white hover:border-[#b7b1ef]"}`}
              aria-pressed={selected}
            >
              <span>{option}</span>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-[#4338ca] bg-[#4338ca]" : "border-[#c9c5dc] bg-white"}`}
              >
                {selected && (
                  <span className="size-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] font-bold text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function TextField({
  question,
  value,
  onChange,
  error,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13.5px] font-extrabold text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={question.required}
        maxLength={500}
        rows={4}
        placeholder="Escreva aqui"
        className={`w-full resize-y rounded-[14px] border-[1.5px] px-4 py-3 text-[15px] leading-6 text-[#1b1830] placeholder:text-[#a29fc0] focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${error ? "border-red-600" : "border-[#e7e5f0]"}`}
      />
      {error && (
        <span role="alert" className="text-[12.5px] font-bold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function Home() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(1);
  const [screen, setScreen] = useState<
    "loading" | "form" | "coupon" | "soldout" | "unavailable"
  >("loading");
  const [previewMode, setPreviewMode] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryState, setDeliveryState] = useState<
    "idle" | "sending" | "sent"
  >("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");

  const questionPages = useMemo(() => {
    if (!campaign) return [] as Question[][];
    return Array.from(
      { length: Math.ceil(campaign.questions.length / questionPageSize) },
      (_, index) =>
        campaign.questions.slice(
          index * questionPageSize,
          (index + 1) * questionPageSize,
        ),
    );
  }, [campaign]);
  const totalSteps = questionPages.length + 2;
  const isIdentityStep = step === 1;
  const isConsentStep = step === totalSteps;
  const activeQuestions =
    !isIdentityStep && !isConsentStep ? (questionPages[step - 2] ?? []) : [];

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (isPreview) {
      setPreviewMode(true);
      setCampaign(previewCampaign);
      setScreen("form");
      return;
    }
    let active = true;
    fetch(`${apiUrl}/campaign`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(apiError(payload));
        if (!active) return;
        setCampaign(payload);
        setScreen("form");
      })
      .catch((reason: Error) => {
        if (!active) return;
        setRequestError(reason.message);
        setScreen("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  function setAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateCurrentStep(): boolean {
    const nextErrors: FieldErrors = {};
    if (isIdentityStep) {
      if (name.trim().length < 2)
        nextErrors.name = "Digite seu nome para continuar.";
      if (phone.replace(/\D/g, "").length < 10)
        nextErrors.phone = "Informe um WhatsApp válido com DDD.";
    } else if (isConsentStep) {
      if (!consent) nextErrors.consent = "Aceite a política para continuar.";
    } else {
      for (const question of activeQuestions) {
        if (question.required && !answers[question.key]?.trim())
          nextErrors[question.key] = "Escolha uma opção para continuar.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (validateCurrentStep())
      setStep((current) => Math.min(current + 1, totalSteps));
  }

  function previousStep() {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConsentStep) {
      nextStep();
      return;
    }
    if (!validateCurrentStep()) return;
    if (previewMode) {
      setResult({ submissionId: "preview-local", couponCode: "GENTE10", isExisting: false });
      setScreen("coupon");
      return;
    }
    setSubmitting(true);
    setRequestError("");
    try {
      const response = await fetch(`${apiUrl}/submissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, answers, consent }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiError(payload));
      setResult(payload);
      setScreen("coupon");
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Não foi possível gerar o cupom.";
      if (isSoldOut(message)) setScreen("soldout");
      else setRequestError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function requestDelivery() {
    if (!result) return;
    if (previewMode) {
      setDeliveryState("sent");
      return;
    }
    setDeliveryState("sending");
    setRequestError("");
    try {
      const response = await fetch(
        `${apiUrl}/submissions/${result.submissionId}/delivery`,
        { method: "POST" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(apiError(payload));
      setDeliveryState("sent");
    } catch (reason) {
      setRequestError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível solicitar o envio.",
      );
      setDeliveryState("idle");
    }
  }

  if (screen === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0a1f] p-6 font-[family-name:var(--font-manrope)]">
        <div className="flex flex-col items-center gap-4 text-sm font-extrabold text-white/70">
          <span className="size-10 animate-spin rounded-full border-[3px] border-white/15 border-t-[#a9a4ff]" />
          Carregando campanha…
        </div>
      </main>
    );
  }

  if (screen === "unavailable") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0a1f] p-5 font-[family-name:var(--font-manrope)]">
        <section className="w-full max-w-[390px] rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#f1f0f8] text-2xl text-[#6b6785]">
            !
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-[#1b1830]">
            Campanha indisponível
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6b6785]">
            {requestError ||
              "Não foi possível carregar a campanha. Tente novamente em instantes."}
          </p>
        </section>
      </main>
    );
  }

  if (screen === "soldout") {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] p-5 font-[family-name:var(--font-manrope)]">
        <section className="flex min-h-[620px] w-full max-w-[390px] flex-col items-center justify-center rounded-3xl bg-white px-7 text-center shadow-2xl">
          <span className="grid size-16 place-items-center rounded-full border border-[#e7e5f0] bg-[#f1f0f8] text-2xl text-[#8b87a8]">
            —
          </span>
          <h1 className="mt-5 text-xl font-extrabold text-[#1b1830]">
            Cupons esgotados por aqui
          </h1>
          <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#6b6785]">
            Os cupons desta rodada de pesquisa já acabaram. Procure a equipe do
            Gente Daqui no seu território para saber sobre novas oportunidades.
          </p>
        </section>
      </main>
    );
  }

  if (screen === "coupon" && result) {
    return (
      <main className="min-h-screen bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] px-5 py-11 font-[family-name:var(--font-manrope)]">
        <section className="mx-auto flex min-h-[660px] w-full max-w-[390px] flex-col rounded-3xl bg-white p-6 shadow-2xl">
          <div className="grid size-14 place-items-center rounded-full bg-[#ecf8f3] text-2xl font-bold text-[#059669]">
            ✓
          </div>
          <div className="mt-5">
            <h1 className="text-[22px] font-extrabold text-[#1b1830]">
              Seu cupom chegou!
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6b6785]">
              Obrigado por participar. Use o código abaixo em comércios
              parceiros do seu território.
            </p>
          </div>
          <div className="mt-6 flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#4338ca] bg-[#f7f6fc] p-5">
            <span className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-[#6b6785]">
              Seu código
            </span>
            <strong className="text-3xl font-extrabold tracking-[.06em] text-[#1b1830]">
              {result.couponCode}
            </strong>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-[#6b6785]">
            Válido em comércios locais parceiros · uma vez por pessoa. Este
            código também pode chegar no seu WhatsApp.
          </p>
          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={requestDelivery}
              disabled={deliveryState !== "idle"}
              className={`h-14 w-full rounded-2xl text-[15px] font-extrabold transition disabled:cursor-not-allowed ${deliveryState === "sent" ? "border-[1.5px] border-[#059669] bg-[#ecf8f3] text-[#059669]" : "bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-70"}`}
            >
              {deliveryState === "sending"
                ? "Solicitando envio…"
                : deliveryState === "sent"
                  ? "Solicitação enviada"
                  : "Enviar para meu WhatsApp"}
            </button>
            {deliveryState === "sent" && (
              <p className="mt-3 text-center text-[12.5px] text-[#6b6785]">
                Você vai receber uma mensagem no WhatsApp em instantes.
              </p>
            )}
            {requestError && (
              <p
                role="alert"
                className="mt-3 text-center text-[12.5px] font-bold text-red-600"
              >
                {requestError}
              </p>
            )}
          </div>
        </section>
        <p className="mx-auto mt-5 max-w-[390px] text-center text-xs leading-5 text-white/35">
          CupomForm para o projeto Gente Daqui
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] px-5 py-11 font-[family-name:var(--font-manrope)]">
      <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(10,8,40,.35),0_4px_16px_rgba(10,8,40,.25)]">
        <form onSubmit={submit} className="flex min-h-[660px] flex-col">
          <header className="border-b border-[#efeef7] bg-[linear-gradient(180deg,#f5f4fb_0%,#fff_100%)] px-6 pb-[18px] pt-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#eceafc] px-3 py-1.5 text-xs font-extrabold tracking-[.02em] text-[#4338ca]">Pesquisa Gente Daqui</span>
              {previewMode && <span className="rounded-full bg-amber-100 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-800">Demonstração local</span>}
            </div>
            <h1 className="mt-3.5 text-[22px] font-extrabold leading-tight text-[#1b1830]">
              {campaign?.title || "Sua trajetória importa"}
            </h1>
            <p className="mt-1.5 text-[14.5px] leading-[1.5] text-[#6b6785]">
              {campaign?.subtitle ||
                "Responda algumas perguntas sobre trabalho e território e ganhe um cupom para usar no comércio local."}
            </p>
            <div className="mt-[18px]">
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <span
                    key={index}
                    className={`h-1 flex-1 rounded-full ${index + 1 <= step ? "bg-[#4338ca]" : "bg-[#e7e5f0]"}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-extrabold text-[#6b6785]">
                Etapa {step} de {totalSteps}
              </p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-[22px] px-6 py-6">
            {isIdentityStep && (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-[13.5px] font-extrabold text-[#1b1830]">
                    Nome<span className="text-red-600"> *</span>
                  </span>
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrors((current) => ({ ...current, name: "" }));
                    }}
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    className={`h-[52px] rounded-[14px] border-[1.5px] px-4 text-base text-[#1b1830] placeholder:text-[#a29fc0] focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${errors.name ? "border-red-600" : "border-[#e7e5f0]"}`}
                  />
                  {errors.name && (
                    <span
                      role="alert"
                      className="text-[12.5px] font-bold text-red-600"
                    >
                      {errors.name}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[13.5px] font-extrabold text-[#1b1830]">
                    WhatsApp<span className="text-red-600"> *</span>
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setErrors((current) => ({ ...current, phone: "" }));
                    }}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 91234-5678"
                    className={`h-[52px] rounded-[14px] border-[1.5px] px-4 text-base text-[#1b1830] placeholder:text-[#a29fc0] focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${errors.phone ? "border-red-600" : "border-[#e7e5f0]"}`}
                  />
                  {errors.phone && (
                    <span
                      role="alert"
                      className="text-[12.5px] font-bold text-red-600"
                    >
                      {errors.phone}
                    </span>
                  )}
                </label>
              </>
            )}
            {activeQuestions.map((question) =>
              question.type === "SINGLE_CHOICE" ? (
                <ChoiceField
                  key={question.key}
                  question={question}
                  value={answers[question.key] ?? ""}
                  onChange={(value) => setAnswer(question.key, value)}
                  error={errors[question.key]}
                />
              ) : (
                <TextField
                  key={question.key}
                  question={question}
                  value={answers[question.key] ?? ""}
                  onChange={(value) => setAnswer(question.key, value)}
                  error={errors[question.key]}
                />
              ),
            )}
            {isConsentStep && (
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#f7f6fc] px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => {
                      setConsent(event.target.checked);
                      setErrors((current) => ({ ...current, consent: "" }));
                    }}
                    className="mt-0.5 size-[22px] shrink-0 accent-[#4338ca]"
                  />
                  <span className="text-[13px] leading-5 text-[#4b4768]">
                    {campaign?.privacyText}
                  </span>
                </label>
                {errors.consent && (
                  <p
                    role="alert"
                    className="text-[12.5px] font-bold text-red-600"
                  >
                    {errors.consent}
                  </p>
                )}
              </div>
            )}
            {requestError && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-[12.5px] font-bold text-red-700"
              >
                {requestError}
              </p>
            )}
            <div className="mt-auto flex gap-3 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={previousStep}
                  className="h-14 rounded-2xl border-[1.5px] border-[#e7e5f0] bg-white px-5 text-[15px] font-extrabold text-[#1b1830]"
                >
                  Voltar
                </button>
              )}
              {isConsentStep ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-14 flex-1 rounded-2xl bg-[#4338ca] text-base font-extrabold text-white transition hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Gerando cupom…" : "Quero meu cupom"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="h-14 flex-1 rounded-2xl bg-[#4338ca] text-base font-extrabold text-white transition hover:bg-[#3730a3]"
                >
                  Avançar
                </button>
              )}
            </div>
          </div>
        </form>
      </section>
      <p className="mx-auto mt-5 max-w-[390px] text-center text-xs leading-5 text-white/35">
        CupomForm para o projeto Gente Daqui · conteúdo ilustrativo
      </p>
    </main>
  );
}

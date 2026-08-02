"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Campaign,
  FieldErrors,
  Question,
  Result,
  ScreenState,
  DeliveryState,
} from "./types";
import { fetchCampaign, submitSubmission, requestDelivery } from "./api";
import { previewCampaign } from "./preview-campaign";
import { NEIGHBORHOOD_QUESTION_KEY } from "./constants";
import {
  validateIdentityStep,
  validateConsentStep,
  validateQuestionsStep,
} from "./validation";
import { FormShell } from "./components/FormShell";
import { IdentityStep } from "./components/IdentityStep";
import { QuestionsStep } from "./components/QuestionsStep";
import { ConsentStep } from "./components/ConsentStep";
import { CouponScreen } from "./components/CouponScreen";
import { SoldOutScreen } from "./components/SoldOutScreen";
import { UnavailableScreen } from "./components/UnavailableScreen";

const QUESTION_PAGE_SIZE = 3;

export function CampaignForm() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(1);
  const [screen, setScreen] = useState<ScreenState>("loading");
  const [previewMode, setPreviewMode] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryState, setDeliveryState] = useState<DeliveryState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");

  // O bairro é perguntado junto com nome e WhatsApp, então sai da paginação.
  const neighborhoodQuestion = useMemo(
    () =>
      campaign?.questions.find(
        (question) => question.key === NEIGHBORHOOD_QUESTION_KEY,
      ) ?? null,
    [campaign],
  );

  const questionPages = useMemo(() => {
    if (!campaign) return [] as Question[][];
    const paged = campaign.questions.filter(
      (question) => question.key !== NEIGHBORHOOD_QUESTION_KEY,
    );
    return Array.from(
      { length: Math.ceil(paged.length / QUESTION_PAGE_SIZE) },
      (_, index) =>
        paged.slice(index * QUESTION_PAGE_SIZE, (index + 1) * QUESTION_PAGE_SIZE),
    );
  }, [campaign]);

  const totalSteps = questionPages.length + 2;
  const isIdentityStep = step === 1;
  const isConsentStep = step === totalSteps;
  const activeQuestions =
    !isIdentityStep && !isConsentStep ? (questionPages[step - 2] ?? []) : [];

  useEffect(() => {
    const isPreview =
      new URLSearchParams(window.location.search).get("preview") === "1";
    if (isPreview) {
      setPreviewMode(true);
      setCampaign(previewCampaign);
      setScreen("form");
      return;
    }
    let active = true;
    fetchCampaign()
      .then((data) => {
        if (!active) return;
        setCampaign(data);
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step, screen]);

  function handleAnswerChange(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateCurrentStep(): boolean {
    let nextErrors: FieldErrors = {};
    if (isIdentityStep) {
      nextErrors = {
        ...validateIdentityStep(name, phone),
        ...validateQuestionsStep(
          neighborhoodQuestion ? [neighborhoodQuestion] : [],
          answers,
        ),
      };
    } else if (isConsentStep) {
      nextErrors = validateConsentStep(consent);
    } else {
      nextErrors = validateQuestionsStep(activeQuestions, answers);
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNextStep() {
    if (validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, totalSteps));
    }
  }

  function handlePreviousStep() {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConsentStep) {
      handleNextStep();
      return;
    }
    if (!validateCurrentStep()) return;
    if (previewMode) {
      setResult({
        submissionId: "preview-local",
        couponCode: "GENTE10",
        isExisting: false,
        soldOut: false,
      });
      setScreen("coupon");
      return;
    }
    setSubmitting(true);
    setRequestError("");
    try {
      const res = await submitSubmission({
        name: name.trim(),
        phone,
        answers,
        consent,
      });
      setResult(res);
      setScreen(res.soldOut ? "soldout" : "coupon");
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Não foi possível gerar o cupom.";
      setRequestError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeliveryRequest() {
    if (!result) return;
    if (previewMode) {
      setDeliveryState("sent");
      return;
    }
    setDeliveryState("sending");
    setRequestError("");
    try {
      await requestDelivery(result.submissionId);
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
    return <UnavailableScreen requestError={requestError} />;
  }

  if (screen === "soldout") {
    return <SoldOutScreen />;
  }

  if (screen === "coupon" && result) {
    return (
      <CouponScreen
        result={result}
        deliveryState={deliveryState}
        requestError={requestError}
        onRequestDelivery={handleDeliveryRequest}
      />
    );
  }

  return (
    <FormShell
      step={step}
      totalSteps={totalSteps}
      stepKind={isIdentityStep ? "identity" : isConsentStep ? "consent" : "questions"}
      previewMode={previewMode}
    >
      <form onSubmit={handleSubmit} className="flex min-h-[660px] flex-col">
        <div key={step} className="flex flex-1 flex-col gap-[22px] px-6 py-6 animate-card-in">
          {isIdentityStep && (
            <IdentityStep
              name={name}
              phone={phone}
              onNameChange={(val) => {
                setName(val);
                setErrors((current) => ({ ...current, name: "" }));
              }}
              onPhoneChange={(val) => {
                setPhone(val);
                setErrors((current) => ({ ...current, phone: "" }));
              }}
              errors={errors}
              neighborhood={neighborhoodQuestion}
              neighborhoodValue={
                neighborhoodQuestion
                  ? (answers[neighborhoodQuestion.key] ?? "")
                  : ""
              }
              onNeighborhoodChange={(val) => {
                if (neighborhoodQuestion) {
                  handleAnswerChange(neighborhoodQuestion.key, val);
                }
              }}
            />
          )}

          {!isIdentityStep && !isConsentStep && (
            <QuestionsStep
              questions={activeQuestions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              errors={errors}
            />
          )}

          {isConsentStep && (
            <ConsentStep
              consent={consent}
              onConsentChange={(val) => {
                setConsent(val);
                setErrors((current) => ({ ...current, consent: "" }));
              }}
              privacyText={campaign?.privacyText}
              errors={errors}
            />
          )}

          {requestError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-[12.5px] font-bold text-red-700 border border-red-200"
            >
              {requestError}
            </p>
          )}

          <div className="mt-auto flex gap-3 pt-1">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="h-14 rounded-2xl border-[1.5px] border-[#e7e5f0] bg-white px-5 text-[15px] font-extrabold text-[#1b1830] transition-colors hover:bg-slate-50 active:scale-[0.99]"
              >
                Voltar
              </button>
            )}
            {isConsentStep ? (
              <button
                type="submit"
                disabled={submitting}
                className="h-14 flex-1 rounded-2xl bg-[#4338ca] text-base font-extrabold text-white transition-all duration-150 hover:bg-[#3730a3] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {submitting ? "Gerando cupom…" : "Quero meu cupom"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="h-14 flex-1 rounded-2xl bg-[#4338ca] text-base font-extrabold text-white transition-all duration-150 hover:bg-[#3730a3] active:scale-[0.99] shadow-md hover:shadow-lg"
              >
                Avançar
              </button>
            )}
          </div>
        </div>
      </form>
    </FormShell>
  );
}

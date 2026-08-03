"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Campaign,
  Answers,
  AnswerValue,
  FieldErrors,
  Question,
  Result,
  ScreenState,
  DeliveryState,
} from "./types";
import { fetchCampaign, submitSubmission, requestDelivery } from "./api";
import { previewCampaign } from "./preview-campaign";
import {
  NEIGHBORHOOD_QUESTION_KEY,
  SPLASH_DURATION_MS,
  SPLASH_EXIT_MS,
} from "./constants";
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
import { SplashScreen } from "./components/SplashScreen";

export function CampaignForm() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
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

  const questionSections = useMemo(() => {
    if (!campaign) return [] as Question[][];
    const grouped = new Map<number, Question[]>();
    campaign.questions
      .filter((question) => question.key !== NEIGHBORHOOD_QUESTION_KEY)
      .forEach((question) => {
        const current = grouped.get(question.section) ?? [];
        current.push(question);
        grouped.set(question.section, current);
      });
    return [...grouped.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, questions]) => questions);
  }, [campaign]);

  const totalSteps = questionSections.length + 2;
  const isIdentityStep = step === 1;
  const isConsentStep = step === totalSteps;
  const activeQuestions =
    !isIdentityStep && !isConsentStep ? (questionSections[step - 2] ?? []) : [];
  const neighborhoodAnswer = neighborhoodQuestion
    ? answers[neighborhoodQuestion.key]
    : undefined;

  useEffect(() => {
    let active = true;
    const isPreview =
      new URLSearchParams(window.location.search).get("preview") === "1";
    // Quem pede menos movimento não deve ser retido numa tela decorativa.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const splashDelay = reducedMotion ? 0 : SPLASH_DURATION_MS;
    const exitDelay = reducedMotion ? 0 : SPLASH_EXIT_MS;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    // Deadline em vez de espera fixa: o que a busca já consumiu conta para o
    // splash, então a abertura nunca soma latência nem à resposta nem ao erro.
    const startedAt = Date.now();
    const remainingSplash = () =>
      Math.max(0, splashDelay - (Date.now() - startedAt));

    async function boot() {
      try {
        const data = await (isPreview
          ? Promise.resolve(previewCampaign)
          : fetchCampaign());
        await wait(remainingSplash());
        if (!active) return;
        setCampaign(data);
        setPreviewMode(isPreview);
      } catch (reason) {
        await wait(remainingSplash());
        if (!active) return;
        setRequestError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar a campanha.",
        );
        setScreen("splash-exit");
        await wait(exitDelay);
        if (!active) return;
        setScreen("unavailable");
        return;
      }
      // Fade-out do splash encadeado com a entrada do card.
      setScreen("splash-exit");
      await wait(exitDelay);
      if (!active) return;
      setScreen("form");
    }

    void boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step, screen]);

  function handleAnswerChange(key: string, value: AnswerValue) {
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

  if (screen === "loading" || screen === "splash-exit") {
    return <SplashScreen leaving={screen === "splash-exit"} />;
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
      stepKind={
        isIdentityStep ? "identity" : isConsentStep ? "consent" : "questions"
      }
      previewMode={previewMode}
    >
      <form onSubmit={handleSubmit} className="flex min-h-[660px] flex-col">
        <div
          key={step}
          className="flex flex-1 flex-col gap-[22px] px-6 py-6 animate-card-in"
        >
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
                typeof neighborhoodAnswer === "string" ? neighborhoodAnswer : ""
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
                {isIdentityStep ? "Iniciar" : "Avançar"}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormShell>
  );
}

-- Submissions must persist even when no coupon is available (sold-out flow).
ALTER TABLE "Submission" ALTER COLUMN "couponId" DROP NOT NULL;

-- New question type for 1-5 Likert-style questions rendered as a slider.
ALTER TYPE "QuestionType" ADD VALUE 'SCALE';

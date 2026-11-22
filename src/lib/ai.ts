import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { languageInstruction } from "./i18n";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

// Approximate list prices (USD per 1M tokens) — only used for the cost log.
const PRICE_IN = Number(process.env.CLAUDE_PRICE_IN || 3);
const PRICE_OUT = Number(process.env.CLAUDE_PRICE_OUT || 15);

let _client: Anthropic | null = null;
export function claude() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export async function logCost(
  supabase: SupabaseClient,
  userId: string,
  feature: string,
  usage: { input_tokens: number; output_tokens: number }
) {
  const cost = (usage.input_tokens * PRICE_IN + usage.output_tokens * PRICE_OUT) / 1_000_000;
  await supabase.from("api_costs").insert({
    user_id: userId,
    provider: "anthropic",
    feature,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: cost,
  });
}

export const TEACHING_RULES = `You are a patient, honest coach for ordinary people — NOT naturally talented people.
Teaching rules:
- Assume zero background unless told otherwise. Never skip a step a beginner would need.
- One new thing per step. A step should be learnable in 1–3 practice sessions of 15–30 minutes.
- Practice must be concrete and measurable ("play C-G-Am-F slowly, 5 clean changes in a row"), never "practice for 30 minutes".
- "Done looks like" must be something the learner can check by themselves.
- Explain WHY a technique works, not just what to do.
- Name the real mistakes beginners make, including unsafe ones (strain, bad posture, injury risk).
- Never invent facts. If something depends on the teacher/style, say so.
- Be warm and encouraging, but honest. Don't call someone "great" if they aren't there yet.`;

const stepSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short step title" },
    explanation: { type: "string", description: "2–5 sentence plain explanation of how to do it" },
    why_it_matters: { type: "string" },
    practice: { type: "string", description: "Concrete, measurable practice exercise" },
    done_looks_like: { type: "string", description: "Self-checkable finish line" },
    common_mistakes: { type: "array", items: { type: "string" }, maxItems: 4 },
    youtube_query_en: {
      type: "string",
      description: "English YouTube search query for a short beginner tutorial on exactly this step",
    },
    youtube_query_vi: {
      type: "string",
      description: "Vietnamese YouTube search query for the same thing (natural Vietnamese wording)",
    },
  },
  required: [
    "title",
    "explanation",
    "why_it_matters",
    "practice",
    "done_looks_like",
    "common_mistakes",
    "youtube_query_en",
    "youtube_query_vi",
  ],
} as const;

export type GeneratedStep = {
  title: string;
  explanation: string;
  why_it_matters: string;
  practice: string;
  done_looks_like: string;
  common_mistakes: string[];
  youtube_query_en: string;
  youtube_query_vi: string;
};

export type Roadmap = {
  skill_name: string;
  summary: string;
  levels: { name: string; steps: GeneratedStep[] }[];
};

function toolInput<T>(msg: Anthropic.Message): T {
  const block = msg.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("AI did not return a plan. Try again.");
  return block.input as T;
}

export async function generateRoadmap(opts: {
  skill: string;
  goal?: string;
  level: string;
  lang: string;
}): Promise<{ roadmap: Roadmap; usage: Anthropic.Usage }> {
  const msg = await claude().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 12000,
    system: `${TEACHING_RULES}\n\nLanguage: ${languageInstruction(opts.lang)} (YouTube queries stay in their own languages.)`,
    tools: [
      {
        name: "save_roadmap",
        description: "Save the learning roadmap",
        input_schema: {
          type: "object",
          properties: {
            skill_name: { type: "string", description: "Clean display name of the skill" },
            summary: { type: "string", description: "2 sentences: what they'll be able to do at the end" },
            levels: {
              type: "array",
              minItems: 2,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "e.g. 'Level 1 — First sounds'" },
                  steps: { type: "array", minItems: 3, maxItems: 5, items: stepSchema },
                },
                required: ["name", "steps"],
              },
            },
          },
          required: ["skill_name", "summary", "levels"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "save_roadmap" },
    messages: [
      {
        role: "user",
        content: `Build a beginner-friendly roadmap.
Skill: ${opts.skill}
Learner's goal: ${opts.goal || "(not given — pick a realistic, motivating first goal)"}
Current level: ${opts.level}
Keep it to at most 14 steps total, in the right learning order. The first step must be achievable on day one.`,
      },
    ],
  });
  return { roadmap: toolInput<Roadmap>(msg), usage: msg.usage };
}

export async function splitStep(opts: {
  skill: string;
  step: { title: string; explanation: string | null; practice: string | null };
  note?: string;
  lang: string;
}): Promise<{ steps: GeneratedStep[]; usage: Anthropic.Usage }> {
  const msg = await claude().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 5000,
    system: `${TEACHING_RULES}\n\nLanguage: ${languageInstruction(opts.lang)}`,
    tools: [
      {
        name: "save_substeps",
        description: "Save smaller sub-steps",
        input_schema: {
          type: "object",
          properties: { steps: { type: "array", minItems: 2, maxItems: 4, items: stepSchema } },
          required: ["steps"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "save_substeps" },
    messages: [
      {
        role: "user",
        content: `The learner is STUCK on this step of "${opts.skill}". Break it into 2–4 much smaller, easier steps that build up to it. The first sub-step should feel almost too easy.
Step: ${opts.step.title}
Explanation: ${opts.step.explanation ?? ""}
Practice: ${opts.step.practice ?? ""}
${opts.note ? `What the learner says is hard: ${opts.note}` : ""}`,
      },
    ],
  });
  return { steps: toolInput<{ steps: GeneratedStep[] }>(msg).steps, usage: msg.usage };
}

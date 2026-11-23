/** Shared art direction so every generated image matches the Sprout It brand art. */
export const SPROUTY =
  "Sprouty, the app mascot: a small, round, mint-green bean-shaped character with two bright lime-green leaves sprouting from the top of its head, big glossy dark eyes, rosy pink cheeks, a happy open smile, a creamy white oval belly, and short stubby arms and legs";

export const ART_STYLE = `Style: soft 3D clay / vinyl-toy render like a premium Duolingo-style learning app. Rounded chunky shapes, soft studio lighting, gentle shadows, smooth matte surfaces, cute and friendly.
Background: soft light mint (#EEF8F2) with a gentle rounded light-green ground shape and a few floating confetti dashes in yellow and blue. Lots of empty breathing room.
Palette only: mint green (#2FBF71), light green (#7BE0A6), sky blue (#2D8CFF), sunny yellow (#FFC531), deep navy (#12233D), off-white.
Strictly no text, no letters, no numbers, no logos, no brand names, no watermarks, no real people.`;

export function stepImagePrompt(skill: string, title: string, explanation: string) {
  return `Wide illustration for one lesson step in a beginner learning app.
Skill: "${skill}". This step: "${title}". What the learner does: ${explanation.slice(0, 400)}

Show ${SPROUTY}, happily doing or trying this exact step, with the key objects of the step clearly visible and simple (e.g. a piano keyboard, a guitar, a pencil and paper, a pan).
Keep it a friendly scene, NOT a technical diagram: simplify details, never draw exact fingerings, chord charts, notes or written words.
Composition: centred, character and objects inside the middle 70% of the frame.
${ART_STYLE}`;
}

export function coverPrompt(skill: string) {
  return `Wide cover illustration for a skill in a beginner learning app. Skill: "${skill}".
Show ${SPROUTY}, excited and ready to start, with the main tools of this skill laid out around it.
Composition: centred, inside the middle 70% of the frame.
${ART_STYLE}`;
}

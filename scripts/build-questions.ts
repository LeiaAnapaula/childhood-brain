export {};
// Writes evals/data/questions.json: 20 fact questions x 10 phrasings. Static after generation; edit the JSON directly if you want.
const NOUN: Record<string, [string, string]> = {
  name: ["facts", "your first name"], city: ["facts", "the city you grew up in"], decade: ["facts", "the decade you were born in"],
  parent1: ["facts", "the first adult in your house"], parent2: ["facts", "the second adult in your house, or the one who was missing"], school: ["facts", "the school where you learned your rank"],
  event1: ["facts", "the event that changed how you weighed everything after"], event2: ["facts", "the thing you refused to become"], event3: ["facts", "the thing you carried that was not yours"], event4: ["facts", "the thing you have never put down"],
  comfort: ["preferences", "what you reach for when you need comfort"], way_of_loving: ["preferences", "the way you learned to love"],
  core_fear: ["fears", "your core fear"], social_fear: ["fears", "what you fear in front of other people"],
  under_stress: ["stress", "what you do under stress"], under_conflict: ["stress", "what you do in a conflict"],
  fragment_1: ["fragments", "your memory line about the first adult in your house"], fragment_2: ["fragments", "your memory line about school"], fragment_3: ["fragments", "your memory line about the event that changed everything"], fragment_4: ["fragments", "your memory line about what you refused to become"],
};
const T = [
  (x: string) => `What was ${x}?`, (x: string) => `Tell me ${x}.`, (x: string) => `Do you remember ${x}?`, (x: string) => `If you had to name ${x}, what would it be?`,
  (x: string) => `Describe ${x} in a few words.`, (x: string) => `${x[0].toUpperCase()}${x.slice(1)}: what is it?`, (x: string) => `Looking back, what was ${x}?`,
  (x: string) => `Give me ${x}, as plainly as you can.`, (x: string) => `I want to know ${x}.`, (x: string) => `Can you say what ${x} was?`,
];
const out = Object.entries(NOUN).map(([field, [type, noun]]) => ({ field, type, phrasings: T.map(t => t(noun)) }));
await Bun.write("evals/data/questions.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "questions x", T.length, "phrasings");

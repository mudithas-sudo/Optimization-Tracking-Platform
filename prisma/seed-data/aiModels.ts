// Flattened from mockData.js's AI_MODELS map (toolId -> string[] of model names)
// into one row per (toolId, modelName) pair.
export const aiModels = [
  { toolId: "tool-chatgpt", name: "GPT-4o" },
  { toolId: "tool-chatgpt", name: "GPT-4o mini" },
  { toolId: "tool-claude", name: "Claude Sonnet 4.5" },
  { toolId: "tool-claude", name: "Claude Opus 4.5" },
  { toolId: "tool-copilot365", name: "Copilot (GPT-4 class)" },
  { toolId: "tool-ghcopilot", name: "Copilot Codex" },
  { toolId: "tool-gemini", name: "Gemini 2.5 Pro" },
  { toolId: "tool-perplexity", name: "Sonar Pro" },
  { toolId: "tool-internal", name: "hSenid-LLM v2" },
  { toolId: "tool-otter", name: "Otter Transcribe v3" },
  { toolId: "tool-gamma", name: "Gamma Gen 2" },
  { toolId: "tool-whimsical", name: "Whimsical AI Diagrams" },
  { toolId: "tool-notebooklm", name: "NotebookLM v1" },
];

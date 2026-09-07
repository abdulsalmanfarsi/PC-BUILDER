export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  history: any;
};

export type Build = {
  Name?: string;
  "Use Case"?: string;
  CPU?: string;
  GPU?: string;
  Motherboard?: string;
  RAM?: string;
  Storage?: string;
  PSU?: string;
  Cooler?: string;
  Case?: string;
  "Estimated Total"?: string;
};

export type AskResponse = {
  answer: string;
  history: any;
  search_log?: string[];
};

export type UserMarket = {
  country: string;
  currency: string;
  currencySymbol: string;
};
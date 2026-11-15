import { env } from "../config/env.js";

const sendSms = async (phone: string, message: string) => {
  if (env.NODE_ENV !== "production") {
    console.log(`[SMS to ${phone}] ${message}`);
    return;
  }

  // TODO: call the real SMS provider here
  throw new Error("SMS provider is not set up yet");
};

export const smsService = {
  sendSms,
};
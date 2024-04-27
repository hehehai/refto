"use server";

import { type Options, renderAsync } from "@react-email/render";
import { Resend } from "resend";
import { type JSXElementConstructor, type ReactElement } from "react";
import { env } from "@/env";
import { site } from "../config/site";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  renderData: ReactElement<any, string | JSXElementConstructor<any>>;
  renderOptions?: Options;
}

export async function sendEmail({
  to,
  subject,
  renderData,
  renderOptions,
}: SendEmailOptions) {
  try {
    const emailHtml = await renderAsync(renderData, renderOptions);

    const status = await resend.emails.send({
      from: `${site.name} <${env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
    });
    if (status.error) {
      throw new Error(status.error.message ?? "unknown");
    }
    return status;
  } catch (err) {
    console.error("[Email] Error sending:", err);
    throw err;
  }
}

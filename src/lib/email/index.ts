"use server";

import { type Options, render } from "@react-email/render";
import type { JSXElementConstructor, ReactElement } from "react";
import { Resend } from "resend";
import { env } from "@/env";
import { site } from "@/lib/config/site";

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
    const emailHtml = await render(renderData, renderOptions);

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

interface BatchSendEmailOptions
  extends Omit<SendEmailOptions, "to" | "renderData"> {
  to: string[];
  renderData: ReactElement<any, string | JSXElementConstructor<any>>[];
}

export async function batchSendEmail({
  to,
  subject,
  renderData,
  renderOptions,
}: BatchSendEmailOptions) {
  try {
    const emailHtml = renderData.map((item) => render(item, renderOptions));

    const mailTask = to.map(async (email, idx) => ({
      from: `${site.name} <${env.EMAIL_USER}>`,
      to: email,
      subject,
      html: (await emailHtml[idx])!,
    }));

    const mails = await Promise.all(mailTask);

    const status = await resend.batch.send(mails);
    if (status.error) {
      throw new Error(status.error.message ?? "unknown");
    }
    return status;
  } catch (err) {
    console.error("[Email] Error sending:", err);
    throw err;
  }
}

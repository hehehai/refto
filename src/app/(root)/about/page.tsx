import type { ReactElement } from "react";

const faqs: { title: string; content: ReactElement[] }[] = [
  {
    title: "Why was it created?",
    content: [
      <p key={1}>
        During my journey of learning web design and interaction, I came across
        many beautiful, interesting, and stunning websites. To showcase and
        quickly find these inspiring websites, I created refto.
      </p>,
      <p key={2}>
        Refto presents snapshots of website homepages in a clean and concise
        manner, displaying the overall style and direction of the websites,
        along with appropriate tags for identification.
      </p>,
    ],
  },
  {
    title: "Who am I?",
    content: [
      <p key={1}>
        Hello everyone, I am "
        <a
          className="underline"
          href="https://hehehai.cn"
          rel="noreferrer"
          target="_blank"
        >
          一块木头
        </a>
        " and you can find me on{" "}
        <a
          className="underline"
          href="https://twitter.com/riverhohai"
          rel="noreferrer"
          target="_blank"
        >
          X
        </a>{" "}
        or{" "}
        <a
          className="underline"
          href="https://github.com/hehehai"
          rel="noreferrer"
          target="_blank"
        >
          Github
        </a>
        . As a UI designer and full-stack developer, website design and
        development keep me energized and passionate. I am wholeheartedly
        pursuing my dreams!
      </p>,
    ],
  },
  {
    title: "When and what will the emails be sent?",
    content: [
      <p key={1}>
        I will send emails every Monday, according to the Shanghai time zone.
        The email content will include curated highlights and recommended
        trending websites from the past week.
      </p>,
    ],
  },
  {
    title: "How can websites be submitted?",
    content: [
      <p key={1}>
        You can click the "Submit" button at the top of the webpage, which will
        open the email submission page. Alternatively, you can directly send an
        email to "
        <a className="underline" href="mailto:riverhohai@gmail.com">
          riverhohai@gmail.com
        </a>
        ". Please make sure to include an accessible webpage link in the email.
        Due to the large volume of website submissions we receive, we may not be
        able to include every submission, but we will select the most
        outstanding ones for display.
      </p>,
    ],
  },
  {
    title: "How can I stay updated on the latest trends?",
    content: [
      <p key={1}>
        Follow my{" "}
        <a
          className="underline"
          href="https://twitter.com/riverhohai"
          rel="noreferrer"
          target="_blank"
        >
          X
        </a>{" "}
        account to be the first to receive the latest trend updates.
      </p>,
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="my-20 md:my-[120px]">
      <div className="container max-w-(--breakpoint-md) space-y-12 md:space-y-32 md:text-center">
        {faqs.map((faq, idx) => (
          <section key={idx as React.Key}>
            <h3 className="section-mark-title mb-6 text-2xl md:mb-10 md:text-4xl">
              {faq.title}
            </h3>
            <div className="space-y-4 md:text-lg">{faq.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

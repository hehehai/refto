const faqs = [
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
        <a href="https://hehehai.cn" target="_blank" className="underline">
          一块木头
        </a>
        " and you can find me on{" "}
        <a
          href="https://twitter.com/riverhohai"
          target="_blank"
          className="underline"
        >
          X
        </a>{" "}
        or{" "}
        <a
          href="https://github.com/hehehai"
          target="_blank"
          className="underline"
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
        <a href="mailto:riverhohai@gmail.com" className="underline">
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
        You can subscribe to the weekly trend{" "}
        <a href="mailto:riverhohai@gmail.com" className="underline">
          email
        </a>{" "}
        or follow my{" "}
        <a
          href="https://twitter.com/riverhohai"
          target="_blank"
          className="underline"
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
    <div className="my-[80px] md:my-[120px]">
      <div className="container max-w-screen-md space-y-12 md:space-y-32 md:text-center">
        {faqs.map((faq, idx) => (
          <section key={idx}>
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

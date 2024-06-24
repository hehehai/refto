const faqs: Record<string, { title: string; content: JSX.Element[] }[]> = {
  en: [
    {
      title: 'Why was it created?',
      content: [
        <p key={1}>
          During my journey of learning web design and interaction, I came
          across many beautiful, interesting, and stunning websites. To showcase
          and quickly find these inspiring websites, I created refto.
        </p>,
        <p key={2}>
          Refto presents snapshots of website homepages in a clean and concise
          manner, displaying the overall style and direction of the websites,
          along with appropriate tags for identification.
        </p>,
      ],
    },
    {
      title: 'Who am I?',
      content: [
        <p key={1}>
          Hello everyone, I am "
          <a
            href="https://hehehai.cn"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            一块木头
          </a>
          " and you can find me on{' '}
          <a
            href="https://twitter.com/riverhohai"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            X
          </a>{' '}
          or{' '}
          <a
            href="https://github.com/hehehai"
            target="_blank"
            className="underline"
            rel="noreferrer"
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
      title: 'When and what will the emails be sent?',
      content: [
        <p key={1}>
          I will send emails every Monday, according to the Shanghai time zone.
          The email content will include curated highlights and recommended
          trending websites from the past week.
        </p>,
      ],
    },
    {
      title: 'How can websites be submitted?',
      content: [
        <p key={1}>
          You can click the "Submit" button at the top of the webpage, which
          will open the email submission page. Alternatively, you can directly
          send an email to "
          <a href="mailto:riverhohai@gmail.com" className="underline">
            riverhohai@gmail.com
          </a>
          ". Please make sure to include an accessible webpage link in the
          email. Due to the large volume of website submissions we receive, we
          may not be able to include every submission, but we will select the
          most outstanding ones for display.
        </p>,
      ],
    },
    {
      title: 'How can I stay updated on the latest trends?',
      content: [
        <p key={1}>
          You can subscribe to the weekly trend{' '}
          <a href="mailto:riverhohai@gmail.com" className="underline">
            email
          </a>{' '}
          or follow my{' '}
          <a
            href="https://twitter.com/riverhohai"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            X
          </a>{' '}
          account to be the first to receive the latest trend updates.
        </p>,
      ],
    },
  ],
  'zh-CN': [
    {
      title: '为什么创建它?',
      content: [
        <p key={1}>
          在我学习网页设计和互动的旅程中，我遇到了许多美丽、有趣且令人惊叹的网站。为了展示并快速找到这些鼓舞人心的网站，我创建了refto。
        </p>,
        <p key={2}>
          Refto以干净、简洁的方式呈现网站主页的快照，显示网站的整体风格和方向，以及适当的识别标签。
        </p>,
      ],
    },
    {
      title: '我是谁?',
      content: [
        <p key={1}>
          大家好，我是“
          <a
            href="https://hehehai.cn"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            一块木头
          </a>
          ” 你可以找到我{' '}
          <a
            href="https://twitter.com/riverhohai"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            X
          </a>{' '}
          或者{' '}
          <a
            href="https://github.com/hehehai"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            Github
          </a>
          。
          作为一名UI设计师和全栈开发人员，网站设计和开发让我充满活力和热情。我全心全意地追求我的梦想!
        </p>,
      ],
    },
    {
      title: '电子邮件将于何时以及发送内容?',
      content: [
        <p key={1}>
          我每周一都会根据上海时区发送电子邮件。电子邮件内容将包括上周精选的亮点和推荐的热门网站。
        </p>,
      ],
    },
    {
      title: '如何提交网站?',
      content: [
        <p key={1}>
          您可以点击网页顶部的“提交”按钮，将打开电子邮件提交页面。或者，您可以直接发送电子邮件至“
          <a href="mailto:riverhohai@gmail.com" className="underline">
            riverhohai@gmail.com
          </a>
          ”.
          请确保在电子邮件中包含可访问的网页链接。由于我们收到的网站提交量很大，我们可能无法包含每一份提交，但我们将选择最优秀的提交进行展示。
        </p>,
      ],
    },
    {
      title: '如何了解最新趋势?',
      content: [
        <p key={1}>
          您可以订阅每周趋势{' '}
          <a href="mailto:riverhohai@gmail.com" className="underline">
            email
          </a>{' '}
          或者关注我的{' '}
          <a
            href="https://twitter.com/riverhohai"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            X
          </a>{' '}
          帐户将成为第一个接收最新趋势更新的帐户。
        </p>,
      ],
    },
  ],
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  return (
    <div className="my-[80px] md:my-[120px]">
      <div className="container max-w-screen-md space-y-12 md:space-y-32 md:text-center">
        {faqs[params.locale]!.map((faq, idx) => (
          <section key={idx}>
            <h3 className="section-mark-title mb-6 text-2xl md:mb-10 md:text-4xl">
              {faq.title}
            </h3>
            <div className="space-y-4 md:text-lg">{faq.content}</div>
          </section>
        ))}
      </div>
    </div>
  )
}

import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { Fragment } from "react";
import { site } from "@/lib/config/site";
import { siteTagMap } from "@/lib/constants";

interface WeeklyProps {
  count: number;
  sites: {
    id: string;
    cover: string;
    title: string;
    url: string;
    tags: string[];
  }[];
  unsubscribeUrl: string;
  baseUrl: string;
}

export const WeeklyEmail = ({
  count,
  sites,
  baseUrl,
  unsubscribeUrl,
}: WeeklyProps) => (
  <Html>
    <Head />
    <Preview>Weekly {site.siteName}</Preview>
    <Tailwind>
      <Fragment>
        <Body className="mx-auto my-auto px-2 font-sans">
          <Container className="mx-auto my-10 max-w-[500px] py-8 text-[#1C1C1C] text-[14px]">
            <Section className="mt-8">
              <Img
                alt={site.siteName}
                className="mx-auto my-0"
                height="70"
                src={`${baseUrl}/images/logo.png`}
                width="70"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-medium text-[24px]">
              Weekly {site.siteName}
            </Heading>
            <Text className="mt-12 mb-16 leading-5">
              This week, I was excited to add {count} selected websites, which
              lit up in front of my eyes and burst of inspiration. Check them
              out now!
            </Text>

            {sites.map((siteItem, idx) => (
              <Section className="mb-10 text-center" key={idx as React.Key}>
                <Link
                  className="text-blue-600 no-underline"
                  href={`${baseUrl}/${siteItem.id}`}
                >
                  <Img
                    alt={siteItem.title}
                    className="my-0 w-full object-cover object-top"
                    height="300"
                    src={siteItem.cover}
                  />
                </Link>
                <Row>
                  <Column className="text-left">
                    <Text className="my-1.5 font-medium text-[16px]">
                      {siteItem.title}
                    </Text>
                  </Column>
                  <Column className="text-right">
                    <Link
                      className="my-1.5 rounded-full bg-blue-600 px-3 py-0.5 font-normal text-[13px] text-white no-underline"
                      href={siteItem.url}
                    >
                      Refto
                    </Link>
                  </Column>
                </Row>
                <Row>
                  <Column className="text-left">
                    <Text className="mt-1 font-normal text-[13px] text-zinc-700">
                      {siteItem.tags
                        .map((tag) => siteTagMap[tag] || tag)
                        .join(", ")}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
            <Text className="mt-16 leading-6">
              Do you like the latest news this week? If you have any feedback on
              refto, please feel free to email us.
            </Text>
            <Hr className="mx-0 mt-12 mb-5 w-full border border-zinc-100 border-solid" />
            <Section className="mb-4">
              <Img
                alt={site.siteName}
                className="mx-auto my-0"
                height="30"
                src={`${baseUrl}/images/logo-text.png`}
              />
            </Section>

            <Text className="text-center leading-6">{site.description}</Text>
            <Text className="text-center text-[12px] leading-6">
              <Link
                className="text-[#666666] no-underline"
                href={unsubscribeUrl}
              >
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Fragment>
    </Tailwind>
  </Html>
);

WeeklyEmail.PreviewProps = {
  count: 24,
  sites: [
    {
      id: "clu1d5p8j001xwzrbgifl4jpa",
      cover:
        "https://storage.refto.one/24-05-04/17148301251023671e2f8d4be79ea2a1b1ad8bb656506.webp",
      title: "roasti.co",
      url: "https://roasti.co",
      tags: ["design", "agency", "parallax", "fun"],
    },
    {
      id: "clu1d5p8j001xwzrbgifl4jpa",
      cover:
        "https://storage.refto.one/24-03-21/171103344476225a0e552a332a7ef7c51e17f16d66f69.webp",
      title: "authkit",
      url: "https://authkit.com",
      tags: ["development", "dark", "transitions", "gradient"],
    },
  ],
  unsubscribeUrl: "https://refto.one/unsub?email=rivehohai@gmail.com&token=123",
  baseUrl: "https://refto.one",
} as WeeklyProps;

export default WeeklyEmail;

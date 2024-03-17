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
import * as React from "react";
import { config } from "../constants";
import { Fragment } from "react";

interface WeeklyProps {
  description: string;
  sites: {
    cover: string;
    title: string;
    url: string;
    tags: string[];
  }[];
  unsubscribeUrl: string;
  baseUrl: string;
}

export const WeeklyEmail = ({
  description,
  sites,
  baseUrl,
  unsubscribeUrl,
}: WeeklyProps) => {
  return (
    <Html>
      <Head />
      <Preview>Weekly {config.siteName}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[500px] py-8 text-[14px] text-[#1C1C1C]">
              <Section className="mt-[32px]">
                <Img
                  src={`${baseUrl}/logo.png`}
                  width="70"
                  height="70"
                  alt={config.siteName}
                  className="mx-auto my-0"
                />
              </Section>
              <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-medium">
                Weekly {config.siteName}
              </Heading>
              <Text className="mb-16 mt-12 leading-[20px]">{description}</Text>

              {sites.map((site, idx) => {
                return (
                  <Section key={idx} className="mb-10 text-center">
                    <Link
                      href={site.url}
                      className="text-blue-600 no-underline"
                    >
                      <Img
                        src={site.cover}
                        height="300"
                        alt={site.title}
                        className="my-0 w-full object-cover object-top"
                      />
                    </Link>
                    <Row>
                      <Column className="text-left">
                        <Text className="my-1.5 text-[16px] font-medium">
                          {site.title}
                        </Text>
                      </Column>
                      <Column className="text-right">
                        <Text className="my-1.5 text-[14px] font-normal">
                          {site.tags.join(" ")}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                );
              })}
              <Text className="mt-16 leading-[24px]">
                Do you like the latest news this week? If you have any feedback
                on refto, please feel free to email us to support@refto.one.
                Remember to follow us on X for more updates!
              </Text>
              <Hr className="mx-0 mb-5 mt-12 w-full border border-solid border-zinc-100" />
              <Section className="mb-4">
                <Img
                  src={`${baseUrl}/images/logo-text.svg`}
                  height="30"
                  alt={config.siteName}
                  className="mx-auto my-0"
                />
              </Section>

              <Text className="text-center leading-[24px]">
                Unleash limitless inspiration Embrace pure simplicity
              </Text>
              <Text className="text-center leading-[24px]">
                <Link
                  href={unsubscribeUrl}
                  className="text-[#666666] no-underline"
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
};

WeeklyEmail.PreviewProps = {
  description:
    "This week, I was excited to add 24 selected websites, which lit up in front of my eyes and burst of inspiration. Check them out now!",
  sites: [
    {
      cover:
        "https://pub-f815ef445d13430e8011cfd52bf4e100.r2.dev/24-03-07/17097953558664b61a654a1071f3fa7d347f4617d0b06.jpg",
      title: "roasti.co",
      url: "https://roasti.co",
      tags: ["design", "agency", "parallax", "fun"],
    },
    {
      cover:
        "https://pub-f815ef445d13430e8011cfd52bf4e100.r2.dev/24-03-07/170979500225282b01b9f81088538c1141656e574c04a.jpg",
      title: "authkit",
      url: "https://authkit.com",
      tags: ["development", "dark", "transitions", "gradient"],
    },
  ],
  unsubscribeUrl: "https://12323.com/123",
  baseUrl: "http://localhost:3000",
} as WeeklyProps;

export default WeeklyEmail;

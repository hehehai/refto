import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";
import { config } from "../constants";
import { Fragment } from "react";

interface AuthEmailProps {
  name: string;
  verifyCode: string;
  verifyUrl: string;
  baseUrl: string;
}

export const UserAuthEmail = ({
  name,
  verifyCode,
  verifyUrl,
  baseUrl,
}: AuthEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to log on to {config.siteName}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto px-2 font-sans">
            <Container className="mx-auto my-[40px] max-w-[500px] py-8 text-[14px] text-[#1C1C1C]">
              <Section className="mt-[32px]">
                <Img
                  src={`${baseUrl}/images/logo.png`}
                  width="70"
                  height="70"
                  alt={config.siteName}
                  className="mx-auto my-0"
                />
              </Section>
              <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-medium">
                Verify your email to log on to {config.siteName}
              </Heading>
              <Text className="mt-12 leading-[20px]">
                Hello <strong>{name}</strong>,
              </Text>
              <Text className="leading-[20px]">
                We have received your email authentication request. The verify
                code:
              </Text>
              <Section className="my-6 rounded-lg bg-[#F9F9F9] p-3.5 text-center">
                <Text className="m-0 text-3xl tracking-widest">
                  {verifyCode}
                </Text>
              </Section>
              <Text className="leading-[24px]">
                You can copy this code and return to the page to complete
                verify.
              </Text>
              <Text className="leading-[24px]">
                You can also click the button below to complete this
                authentication directly.
              </Text>
              <Section className="mb-[32px] mt-[32px] text-center">
                <Button
                  className="rounded-lg bg-[#000000] px-10 py-3.5 text-center text-[15px] font-medium tracking-widest text-white no-underline"
                  href={verifyUrl}
                >
                  VERIFY
                </Button>
              </Section>
              <Text className="leading-[24px]">
                Or copy and paste this URL into a new tab of your browser:
              </Text>
              <Link href={verifyUrl} className="text-blue-600 no-underline">
                {verifyUrl}
              </Link>
              <Hr className="mx-0 mb-5 mt-12 w-full border border-solid border-zinc-100" />
              <Text className="text-[12px] leading-[24px] text-[#666666]">
                If you did not try to log in but received this email, please
                ignore this email. If you are concerned about the security of
                your account, please visit our{" "}
                <Link
                  href={`${baseUrl}/about`}
                  className="text-blue-600 no-underline"
                >
                  help page
                </Link>
                .
              </Text>
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  );
};

UserAuthEmail.PreviewProps = {
  name: "riverhohai",
  verifyCode: "123456",
  verifyUrl: "http://auth/123utf091",
  baseUrl: "http://localhost:3000",
} as AuthEmailProps;

export default UserAuthEmail;

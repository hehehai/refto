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
import { Fragment } from "react";
import { site } from "@/lib/config/site";

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
}: AuthEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to log on to {site.siteName}</Preview>
    <Tailwind>
      <Fragment>
        <Body className="mx-auto my-auto px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[500px] py-8 text-[#1C1C1C] text-[14px]">
            <Section className="mt-[32px]">
              <Img
                alt={site.siteName}
                className="mx-auto my-0"
                height="70"
                src={`${baseUrl}/images/logo.png`}
                width="70"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-medium text-[24px]">
              Verify your email to log on to {site.siteName}
            </Heading>
            <Text className="mt-12 leading-[20px]">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="leading-[20px]">
              We have received your email authentication request. The verify
              code:
            </Text>
            <Section className="my-6 rounded-lg bg-[#F9F9F9] p-3.5 text-center">
              <Text className="m-0 text-3xl tracking-widest">{verifyCode}</Text>
            </Section>
            <Text className="leading-[24px]">
              You can copy this code and return to the page to complete verify.
            </Text>
            <Text className="leading-[24px]">
              You can also click the button below to complete this
              authentication directly.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded-lg bg-[#000000] px-10 py-3.5 text-center font-medium text-[15px] text-white tracking-widest no-underline"
                href={verifyUrl}
              >
                VERIFY
              </Button>
            </Section>
            <Text className="leading-[24px]">
              Or copy and paste this URL into a new tab of your browser:
            </Text>
            <Link className="text-blue-600 no-underline" href={verifyUrl}>
              {verifyUrl}
            </Link>
            <Hr className="mx-0 mt-12 mb-5 w-full border border-zinc-100 border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you did not try to log in but received this email, please
              ignore this email. If you are concerned about the security of your
              account, please visit our{" "}
              <Link
                className="text-blue-600 no-underline"
                href={`${baseUrl}/about`}
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

UserAuthEmail.PreviewProps = {
  name: "riverhohai",
  verifyCode: "123456",
  verifyUrl: "http://auth/123utf091",
  baseUrl: "http://localhost:3000",
} as AuthEmailProps;

export default UserAuthEmail;

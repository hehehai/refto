import { Button, Heading, Link, Section, Text } from "@react-email/components";
import { site } from "@refto-one/config";
import { BaseLayout } from "./base-layout";

interface VerificationEmailProps {
  name: string;
  verifyCode: string;
  verifyUrl: string;
  baseUrl: string;
}

export const VerificationEmail = ({
  name,
  verifyCode,
  verifyUrl,
  baseUrl,
}: VerificationEmailProps) => (
  <BaseLayout
    baseUrl={baseUrl}
    footerText="If you did not try to log in but received this email, please ignore this email. If you are concerned about the security of your account, please visit our"
    previewText={`Verify your email to log on to ${site.siteName}`}
  >
    <Heading className="mx-0 my-[30px] p-0 text-center font-medium text-[24px]">
      Verify your email to log on to {site.siteName}
    </Heading>
    <Text className="mt-12 leading-[20px]">
      Hello <strong>{name}</strong>,
    </Text>
    <Text className="leading-[20px]">
      We have received your email authentication request. The verify code:
    </Text>
    <Section className="my-6 rounded-lg bg-[#F9F9F9] p-3.5 text-center">
      <Text className="m-0 text-3xl tracking-widest">{verifyCode}</Text>
    </Section>
    <Text className="leading-[24px]">
      You can copy this code and return to the page to complete verify.
    </Text>
    <Text className="leading-[24px]">
      You can also click the button below to complete this authentication
      directly.
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
  </BaseLayout>
);

VerificationEmail.PreviewProps = {
  name: "riverhohai",
  verifyCode: "123456",
  verifyUrl: "http://auth/123utf091",
  baseUrl: "http://localhost:3000",
} as VerificationEmailProps;

export default VerificationEmail;

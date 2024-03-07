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

interface AuthEmailProps {
  actionUrl: string;
  title: string;
  baseUrl: string;
}

export const UserAuthEmail = ({
  actionUrl,
  title,
  baseUrl,
}: AuthEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your {title} magic link</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-xl my-[40px] mx-auto px-6 py-8 max-w-[500px]">
            <Img
              src={`${baseUrl}/static/logo.png`}
              width="42"
              height="42"
              alt="Linear"
              className="mb-10"
            />
            <Heading className="text-[24px] leading-8 font-semibold text-[#484848]">
              🪄 Your {title} magic link
            </Heading>
            <Section className="my-6">
              <Button
                className="bg-violet-600 rounded-lg text-white text-md px-5 py-3"
                href={actionUrl}
              >
                Click here to {title}
              </Button>
            </Section>
            <Text className="text-gray-600 text-sm">
              If you didn't request this, please ignore this email.
            </Text>
            <Hr className="border-b border-gray-200 mt-10 mb-5" />
            <Link href={baseUrl} className="text-xs text-gray-500">
              LangMaker
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

UserAuthEmail.PreviewProps = {
  title: "Login code",
  actionUrl: "http://auth/123utf091",
  baseUrl: "http://localhost:3000",
} as AuthEmailProps;

export default UserAuthEmail;

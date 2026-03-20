import { Html, Head, Body, Container, Heading, Text, Section, Button, Hr, Link } from "@react-email/components";

interface Props {
  clientName: string;
  artistName: string;
  date: string;
  time: string;
  consentUrl: string;
}

export function ConsentFormLinkEmail({ clientName, artistName, date, time, consentUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            Action required: Sign your consent form
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {clientName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            Your appointment with {artistName} is in 48 hours ({date} at {time}).
            Please sign your consent form before arriving.
          </Text>
          <Button
            href={consentUrl}
            style={{
              backgroundColor: "#c9a84c",
              color: "#000000",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
              margin: "16px 0",
            }}
          >
            Sign Consent Form
          </Button>
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            This link expires after your appointment date.
          </Text>
          <Hr style={{ borderColor: "#2a2a2a" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            Managed by <Link href="https://inkbook.io" style={{ color: "#c9a84c" }}>InkBook</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

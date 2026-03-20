import { Html, Head, Body, Container, Heading, Text, Button, Hr, Link } from "@react-email/components";

interface Props {
  clientName: string;
  artistName: string;
  submitUrl: string;
}

export function HealedPhotoRequestEmail({ clientName, artistName, submitUrl }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            How&apos;s your tattoo healing?
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {clientName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            It&apos;s been about 8 weeks since your session with {artistName} — your tattoo should be
            fully healed by now! We&apos;d love to see how it turned out.
          </Text>
          <Text style={{ color: "#a1a1aa" }}>
            If you&apos;re happy with it, consider sharing a healed photo. {artistName} would really appreciate it.
          </Text>
          <Button
            href={submitUrl}
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
            Submit Healed Photo
          </Button>
          <Hr style={{ borderColor: "#2a2a2a" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            From {artistName} via <Link href="https://inkbook.io" style={{ color: "#c9a84c" }}>InkBook</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

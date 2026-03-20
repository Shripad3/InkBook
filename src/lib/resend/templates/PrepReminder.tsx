import { Html, Head, Body, Container, Heading, Text, Section, Hr, Link } from "@react-email/components";

interface Props {
  clientName: string;
  artistName: string;
  date: string;
  time: string;
}

export function PrepReminderEmail({ clientName, artistName, date, time }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f0f0f", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#c9a84c", fontSize: "24px", marginBottom: "8px" }}>
            InkBook
          </Heading>
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            Your appointment is in 48 hours
          </Heading>
          <Text style={{ color: "#a1a1aa" }}>Hi {clientName},</Text>
          <Text style={{ color: "#a1a1aa" }}>
            A reminder that your session with {artistName} is on <strong style={{ color: "#ffffff" }}>{date} at {time}</strong>.
          </Text>

          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px", margin: "16px 0" }}>
            <Text style={{ color: "#c9a84c", fontWeight: "600", margin: "0 0 12px" }}>How to prepare</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Eat a full meal 1–2 hours before your session</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Stay well hydrated over the next 48 hours</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• No alcohol for at least 24 hours before</Text>
            <Text style={{ color: "#a1a1aa", margin: "0 0 6px" }}>• Wear loose clothing that exposes the area being tattooed</Text>
            <Text style={{ color: "#a1a1aa", margin: "0" }}>• Moisturise the skin (but not on the day itself)</Text>
          </Section>

          <Hr style={{ borderColor: "#2a2a2a", margin: "24px 0" }} />
          <Text style={{ color: "#71717a", fontSize: "12px" }}>
            Reminder from {artistName} via <Link href="https://inkbook.io" style={{ color: "#c9a84c" }}>InkBook</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

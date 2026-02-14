import { Container } from "@/components/Container";
import { Card } from "@/components/Card";

export default function ContactPage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
      <p className="mt-3 max-w-2xl opacity-85">
        This starter version uses a simple mail link. If you want a working form (email delivery + spam protection),
        tell me which inbox you want to receive messages at and I’ll wire it up.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="font-semibold">Email</div>
          <a className="mt-2 block text-sm opacity-85 underline" href="mailto:support@reefcultures.com">
            support@reefcultures.com
          </a>
          <div className="mt-2 text-sm opacity-70">Change this address anytime.</div>
        </Card>
        <Card>
          <div className="font-semibold">Response time</div>
          <div className="mt-2 text-sm opacity-80">Typically within 1 business day.</div>
        </Card>
      </div>
    </Container>
  );
}

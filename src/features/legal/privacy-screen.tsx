import LegalPage, { Email, List, Pairs, Section, Sub, TextLink } from "./legal-page";

// The privacy policy, at /privacy. The founder's text (the same as on
// becomely.co), plus a few facts the app itself adds: birthplace, payments
// through Stripe, notifications and bug reports. Analytics in the app are
// always on (founder, 2026-09-29), so their basis is legitimate interests,
// not consent, and there is no Cookie settings switch. Keep the two in step.
export default function PrivacyScreen() {
  return (
    <LegalPage title="Privacy policy" updated="29 September 2026">
      <p>
        This policy explains what personal information Becomely collects when you use our website (becomely.co) and our
        app (app.becomely.co), why we collect it, and the choices you have. Becomely is offered to people in the United
        States. We have written this policy to be read, so if anything is unclear, contact us.
      </p>

      <Section title="Who we are">
        <p>
          Becomely is operated by Brightverse MB, a company registered in Lithuania at Gedimino g. 22A-14, LT-44319
          Kaunas, Lithuania (&ldquo;Becomely&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the data controller
          for the personal information described in this policy. Because we are based in the European Union, we handle
          all personal information in line with the EU General Data Protection Regulation (GDPR), as well as the US
          state privacy laws described below.
        </p>
        <p>
          Contact: <Email />
        </p>
      </Section>

      <Section title="Our privacy principles">
        <List
          items={[
            "Your private writing stays private. We do not sell it, share it for advertising or use it to profile you.",
            "Our analytics do not capture the content of your journal, notes, intentions, affirmations or vision boards.",
            "You can delete your account and the information linked to it.",
          ]}
        />
      </Section>

      <Section title="What we collect">
        <Sub>Account information</Sub>
        <p>
          Your name, email address and login details when you create an account. If you sign in with Google, Google
          shares your email address with us.
        </p>

        <Sub>Birth details</Sub>
        <p>
          Your date, time and place of birth. We use these to calculate your birth chart and daily focus cards. If you
          don&rsquo;t know your exact birth time, you can still use the app, and some details may be less precise.
        </p>

        <Sub>Your content</Sub>
        <p>
          Journal entries, notes, to-do lists, daily intentions, reflections, limiting beliefs, affirmations and vision
          board images and words that you create in the app. You decide what to write. Some of it may be personal,
          including things about your health, relationships or beliefs. We store it so the app can show it back to you,
          and for no other purpose.
        </p>

        <Sub>Payment information</Sub>
        <p>
          If you subscribe to Becomely+, your payment is handled by Stripe. We receive your subscription status, plan and
          billing dates, but never your full card details.
        </p>

        <Sub>Notifications</Sub>
        <p>
          If you turn on notifications, we store the address your browser gives us for sending them and your time zone,
          so reminders arrive at the right local time. Notifications contain general reminder text, never your content.
        </p>

        <Sub>Usage and device information</Sub>
        <p>
          We use PostHog to understand how people use the website and app, such as which pages and features are opened,
          which buttons are pressed, the browser and device type, approximate location derived from your IP address, and
          referring website. This is set up to exclude the text and images you create in the app. Analytics are part of
          how we run and improve Becomely, so they are always on in the app. You can object to them at any time by
          emailing us (see Your privacy rights).
        </p>

        <Sub>Messages and bug reports</Sub>
        <p>
          If you email us, we keep the message and our reply so we can help you. If you report a bug in the app, we
          store what you write together with your app version, browser and device type, and screen size.
        </p>
      </Section>

      <Section title="How we use it">
        <List
          items={[
            "to create and run your account, calculate your chart, and save and show your content",
            "to process payments and manage your Becomely+ subscription",
            "to send the notifications you turn on",
            "to keep the service secure, prevent misuse and fix problems",
            "to understand how Becomely is used so we can improve it",
            "to send service emails, such as account and security messages",
            "to send product news and updates, if you ask for them. You can unsubscribe at any time.",
            "to meet our legal and tax obligations",
          ]}
        />
        <p>
          Some of what you write may count as sensitive personal information under state privacy laws, such as details
          about your health. We use it only to provide the service to you, and never to infer things about you.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          We do not sell your personal information, and we do not share it for targeted or cross-context behavioral
          advertising. We share it only with service providers who help us run Becomely, under contracts that limit
          their use of it to providing services to us:
        </p>
        <List
          items={[
            "PostHog for product analytics, hosted in the European Union.",
            "Supabase to store your account and content, handle login and send account emails.",
            "Netlify to host the website and app.",
            "Stripe to process payments and manage subscriptions.",
            "Your browser’s push service (for example Apple, Google or Mozilla) to deliver notifications, if you turn them on.",
          ]}
        />
        <p>
          We may also disclose information if the law requires it, to protect the rights and safety of our users or
          Becomely, or as part of a merger or sale of our business, in which case this policy will continue to apply to
          your information.
        </p>
      </Section>

      <Section title="Our legal basis under GDPR">
        <Pairs
          heads={["Purpose", "Legal basis"]}
          rows={[
            [
              "Create and run your account, calculate your chart, save and show your content",
              "Performance of our contract with you",
            ],
            ["Process payments and manage your subscription", "Performance of our contract with you"],
            ["Send the notifications you turn on", "Your consent, which you can withdraw by turning them off"],
            ["Keep the service secure, prevent misuse and fix problems", "Our legitimate interests"],
            [
              "Product analytics with PostHog",
              "Our legitimate interests in understanding how Becomely is used so we can improve it. Analytics never include what you write or upload.",
            ],
            ["Service emails, such as account and security messages", "Performance of our contract with you"],
            ["Product news and updates", "Your consent, which you can withdraw at any time"],
            ["Meet legal and tax obligations", "Legal obligation"],
          ]}
        />
        <p>
          Where your writing includes special category data, such as details about your health or beliefs, we process
          it only because you chose to store it in the app, and only to provide the service to you.
        </p>
      </Section>

      <Section title="Where your information is stored">
        <p>
          Our service providers may store and process your information in the United States, the European Union and
          other countries where they operate. When information is transferred outside the European Economic Area, we
          rely on the EU–US Data Privacy Framework or the European Commission&rsquo;s Standard Contractual Clauses to
          protect it.
        </p>
      </Section>

      <Section title="How long we keep it">
        <List
          items={[
            "Account information, birth details and content: while your account is open. When you delete your account, we delete this information within 30 days, apart from backups, which are overwritten within 90 days.",
            "Analytics data: up to 12 months.",
            "Emails with us: up to 2 years after the conversation ends.",
          ]}
        />
      </Section>

      <Section title="Your privacy rights">
        <p>
          Under the GDPR, and under the privacy laws of US states such as California, Colorado, Connecticut and
          Virginia, you have the right to:
        </p>
        <List
          items={[
            "know what personal information we collect, use and disclose, and get a copy of it",
            "correct information that is wrong",
            "delete your information, including by deleting your account in the app",
            "receive your information in a portable format",
            "object to or restrict how we use it",
            "withdraw your consent at any time, without affecting earlier use",
            "opt out of the sale or sharing of your information and of targeted advertising. We do neither.",
            "not be treated differently for using any of these rights",
          ]}
        />
        <p>
          We offer these rights to all our users, wherever they live. To use them, email <Email />. We will respond
          within one month. We may need to verify your identity first, usually by confirming the email address on your
          account. You can also ask someone to make a request for you, with your written permission.
        </p>
        <p>
          If we decline your request, you can appeal by replying to our decision. You can also complain to the
          Lithuanian State Data Protection Inspectorate (vdai.lrv.lt) or, in the US, to your state attorney general.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use encryption in transit (HTTPS), access controls and reputable infrastructure providers to protect your
          information. No online service is completely secure, so please use a strong, unique password.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Becomely is not intended for anyone under 16. We do not knowingly collect personal information from children
          under 13. If you think a child has given us personal information, contact us and we will delete it.
        </p>
      </Section>

      <Section title="Cookies and Do Not Track">
        <p>
          We use cookies and similar technologies, such as your browser&rsquo;s local storage, to keep you logged in, to
          keep your writing available offline, and for analytics. These are part of how the app works, so they are
          always on in the app. There is no common standard for browser Do Not Track signals, so we do not respond to
          them.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make meaningful changes, we will update the date above and let you know in the app or by email before
          they take effect. Please also read our <TextLink to="/terms">terms of service</TextLink>.
        </p>
      </Section>
    </LegalPage>
  );
}

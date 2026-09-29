import LegalPage, { Caps, Email, List, Section, Sub, TextLink } from "./legal-page";

// The terms of service, at /terms. The founder's text (the same as on
// becomely.co), with the general "paid features" paragraph replaced by the
// actual Becomely+ terms (trial, prices, automatic renewal, cancelling,
// refunds — US automatic-renewal laws expect these spelled out), plus
// notifications, feedback, resolving problems and the usual general clauses.
// If prices or the trial change in billing/plans.ts, change them here too.
export default function TermsScreen() {
  return (
    <LegalPage title="Terms of service" updated="29 September 2026">
      <p>
        These terms apply when you use the Becomely website (becomely.co) and app (app.becomely.co). By creating an
        account or using Becomely, you agree to them. Please read them alongside our{" "}
        <TextLink to="/privacy">privacy policy</TextLink>. Becomely is offered to people in the United States.
      </p>

      <Section title="Who we are">
        <p>
          Becomely is operated by Brightverse MB, a company registered in Lithuania at Gedimino g. 22A-14, LT-44319
          Kaunas, Lithuania. You can contact us at <Email />.
        </p>
      </Section>

      <Section title="What Becomely is">
        <p>
          Becomely is a personal practice app. It combines astrology, affirmations, vision boards and journalling to
          help you set intentions and reflect on your day.
        </p>
        <p>
          Astrology content in Becomely is offered as a prompt for reflection. It does not predict events, and we make
          no promise about outcomes from using affirmations, manifestation or any other practice in the app. Becomely is
          not medical, psychological, financial or legal advice. If you need that kind of help, please speak to a
          qualified professional. If you are in crisis, call or text 988 (Suicide &amp; Crisis Lifeline) or call 911.
        </p>
      </Section>

      <Section title="Your account">
        <List
          items={[
            "You must be at least 16 years old to use Becomely.",
            "Give accurate information when you sign up and keep your login details secure.",
            "You are responsible for activity on your account. Tell us straight away if you think someone else has accessed it.",
            "You can delete your account at any time in the app.",
          ]}
        />
      </Section>

      <Section title="Your content">
        <p>
          You own what you write and upload, including journal entries, notes, intentions, affirmations and vision board
          images. You give us a limited licence to store, process and display that content only to provide Becomely to
          you. We do not use it for advertising and we do not publish it.
        </p>
        <p>Only upload images and material you have the right to use.</p>
      </Section>

      <Section title="Analytics">
        <p>
          To run and improve Becomely, the app records how it is used, such as which screens and features are opened
          and the type of device, as described in our <TextLink to="/privacy">privacy policy</TextLink>. This is part
          of the service and is always on in the app. It never includes what you write or upload.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>Please don&rsquo;t:</p>
        <List
          items={[
            "break the law or infringe anyone else’s rights using Becomely",
            "try to access other people’s accounts or data",
            "interfere with, overload or reverse engineer the service",
            "use automated tools to scrape or copy the app",
            "resell or redistribute Becomely without our permission",
          ]}
        />
      </Section>

      <Section title="Our content">
        <p>
          The Becomely name, design, illustrations, text and software belong to us or our licensors. You may use them
          only as part of your personal use of Becomely.
        </p>
      </Section>

      <Section title="Becomely+ subscriptions">
        <p>
          Some features, including daily focus cards, evening reflections, affirmations and notifications, are part of
          Becomely+, our paid plan. Your notes, a vision board and your birth chart stay free. On the free plan you can
          keep one vision board with up to 10 photos.
        </p>

        <Sub>Free trial</Sub>
        <p>
          When you finish setting up your account, you get 7 days of Becomely+ for free. No payment card is needed, and
          you are not charged when the trial ends: you move to the free plan unless you choose to subscribe. If you
          subscribe during your trial, you are charged straight away and your paid subscription starts that day.
        </p>

        <Sub>Prices</Sub>
        <p>
          Becomely+ costs US$7.99 a month or US$71.99 a year. Prices do not include sales tax, which is added at checkout
          where it applies. The price and billing period are shown before you pay.
        </p>

        <Sub>Automatic renewal</Sub>
        <p>
          Your subscription renews automatically at the end of each billing period, monthly or yearly, and you are
          charged the price for your plan using your saved payment method, until you cancel.
        </p>

        <Sub>Cancelling</Sub>
        <p>
          You can cancel at any time in the app: go to Profile, then Your plan, and choose Cancel subscription.
          Cancelling stops future renewals. You keep Becomely+ until the end of the period you have already paid for,
          then move to the free plan. Your notes stay yours.
        </p>

        <Sub>Refunds</Sub>
        <p>
          Payments are non-refundable, and we do not refund partly used billing periods, except where the law requires
          it. If you think you were charged by mistake, contact us at <Email />.
        </p>

        <Sub>Deleting your account</Sub>
        <p>
          If you delete your account while subscribed, your subscription is cancelled straight away and you will not be
          charged again. The rest of the current period is not refunded.
        </p>

        <Sub>Price changes</Sub>
        <p>
          If we change the price of Becomely+, we will tell you at least 30 days before the new price applies to you, so
          you can cancel before then if you wish.
        </p>

        <Sub>Payments</Sub>
        <p>
          Payments are processed by Stripe. Stripe&rsquo;s own terms and privacy policy also apply to your payment.
          Nothing in these terms takes away rights you have under consumer protection laws that cannot be waived.
        </p>
      </Section>

      <Section title="Notifications">
        <p>
          If you turn on notifications, we send reminders for your daily practice. You can turn them off at any time in
          your Profile or in your phone&rsquo;s settings.
        </p>
      </Section>

      <Section title="Feedback">
        <p>
          If you send us feedback or a bug report, we may use it to improve Becomely, without any obligation to you.
        </p>
      </Section>

      <Section title="Changes and availability">
        <p>
          We are still building Becomely, so features may change, be added or be removed. We work to keep the service
          available but cannot guarantee it will always be uninterrupted or free of errors. If we make a change that
          significantly affects you, we will tell you in advance.
        </p>
      </Section>

      <Section title="Ending your use">
        <p>
          You can stop using Becomely and delete your account at any time. We may suspend or close an account that
          breaks these terms or puts other users or the service at risk. Where reasonable, we will tell you why first.
        </p>
      </Section>

      <Section title="Disclaimer">
        <Caps>
          BECOMELY IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;. TO THE EXTENT THE LAW ALLOWS, WE
          DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE AND NON-INFRINGEMENT.
        </Caps>
      </Section>

      <Section title="Liability">
        <Caps>
          TO THE EXTENT THE LAW ALLOWS, WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, OR
          FOR DECISIONS YOU MAKE BASED ON CONTENT IN THE APP. OUR TOTAL LIABILITY TO YOU IS LIMITED TO THE GREATER OF THE
          AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR US$100.
        </Caps>
        <p>
          Some states do not allow certain warranties to be excluded or liability to be limited, so some of the above
          may not apply to you.
        </p>
        <p>
          Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for
          anything else that cannot be limited by law.
        </p>
      </Section>

      <Section title="Resolving problems">
        <p>
          If something goes wrong, please contact us first at <Email /> so we can try to put it right. Most problems can
          be solved this way, quickly and without cost.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms from time to time. If a change is significant, we will let you know in the app or by
          email before it takes effect. If you keep using Becomely after that, the new terms apply.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the Republic of Lithuania, without regard to its conflict of law
          rules. If you are a consumer, you also keep the protection of the mandatory consumer protection laws of the
          state where you live, and you may bring a claim in the courts where you live.
        </p>
      </Section>

      <Section title="General">
        <p>
          These terms, together with our privacy policy and anything shown to you when you subscribe, are the whole
          agreement between you and us about Becomely. If any part of them is found unenforceable, the rest still
          applies. If we don&rsquo;t enforce a right straight away, we can still enforce it later. You may not transfer
          your account or these terms to anyone else. We may transfer our rights under these terms as part of a merger
          or sale of our business, and these terms will continue to apply to you.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms: <Email />
        </p>
      </Section>
    </LegalPage>
  );
}

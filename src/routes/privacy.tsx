import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy | Tech Leader Hub" }, { name: "description", content: "Privacy information for Tech Leader Hub website and platform users." }]}),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PublicPageShell eyebrow="Legal" title="Privacy Policy" description="This page explains the basic categories of information TLH may collect through its website and platform.">
    <ContentSection title="Who operates Tech Leader Hub"><p>Nikhil Rai, operating as Tech Leader Hub, is the current operator of this website and the associated platform and masterclass registration flows. Contact: hello@techleaderhub.com.</p></ContentSection>
    <ContentSection title="Information we collect"><p>Depending on the feature you use, TLH may collect information such as your name, email address, phone number, account information, registration details, and information you choose to provide for career-related features.</p></ContentSection>
    <ContentSection title="How information is used"><p>Information may be used to provide requested services, manage accounts, operate masterclass registrations, communicate with users, improve the platform, and maintain security.</p></ContentSection>
    <ContentSection title="Third-party services"><p>TLH may use service providers for authentication, course delivery, marketing automation, analytics, communications, and other operational functions. Specific integrations may change as the platform develops.</p></ContentSection>
    <ContentSection title="Masterclass registrations"><p>When you register for a TLH masterclass, the form may collect your name, email address, phone or WhatsApp number, experience level, current role, and the challenge you describe. This information is used to manage the registration, communicate about the session, and support requested career guidance.</p></ContentSection>
    <ContentSection title="Your choices"><p>You can contact Nikhil Rai at hello@techleaderhub.com with questions about information associated with your account or registrations. This page is a product launch baseline and should be reviewed with appropriate legal counsel before production publication.</p></ContentSection>
  </PublicPageShell>;
}

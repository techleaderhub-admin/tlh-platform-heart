import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Use | Tech Leader Hub" }, { name: "description", content: "Terms of use for the Tech Leader Hub website and platform." }]}),
  component: TermsPage,
});

function TermsPage() {
  return <PublicPageShell eyebrow="Legal" title="Terms of Use" description="Baseline terms for using Tech Leader Hub websites, content, and platform features.">
    <ContentSection title="Operator"><p>Tech Leader Hub is currently operated by Nikhil Rai. Tech Leader Hub and Droid Skool are brands founded by Nikhil Rai and are not being presented on this website as registered companies unless expressly stated.</p></ContentSection>
    <ContentSection title="Use of the platform"><p>Use TLH services for lawful purposes and provide accurate information when creating an account or registering for a service.</p></ContentSection>
    <ContentSection title="Career content"><p>TLH provides educational and career-development resources. Individual career outcomes depend on many factors and are not guaranteed.</p></ContentSection>
    <ContentSection title="Accounts"><p>Keep your account credentials secure and do not share access with unauthorized users. TLH may restrict access when necessary to protect the platform or users.</p></ContentSection>
    <ContentSection title="Contact"><p>For questions about these terms, contact hello@techleaderhub.com.</p></ContentSection>
    <ContentSection title="Updates"><p>These terms may be updated as the TLH platform and services evolve. This launch baseline should be reviewed with appropriate legal counsel before production publication.</p></ContentSection>
  </PublicPageShell>;
}

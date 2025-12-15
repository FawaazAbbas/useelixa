import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Terms of Service</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Elixa's AI talent platform and services, you agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Elixa provides an AI talent marketplace where users can access, install, and interact 
                with specialized AI agents designed to assist with various business functions including 
                marketing, sales, operations, customer support, and more. Our platform enables 
                collaboration between humans and AI agents within customizable workspaces.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update any information to keep it accurate</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use our services to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Transmit malicious code or interfere with the service</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Generate content that is illegal, harmful, or deceptive</li>
                <li>Use AI agents to impersonate real individuals without consent</li>
                <li>Circumvent any access controls or usage limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. AI Agent Usage</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our AI agents are designed to assist with business tasks and provide recommendations. 
                However, AI-generated content and decisions should be reviewed by humans before 
                implementation. We do not guarantee the accuracy, completeness, or suitability of 
                AI agent outputs for any specific purpose. You are responsible for verifying and 
                validating any outputs before relying on them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Elixa platform, including all software, designs, text, and other content, is 
                owned by Elixa or its licensors and is protected by intellectual property laws. 
                Content you create using our platform remains yours, but you grant us a license 
                to use, store, and process it as necessary to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Third-Party Integrations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may integrate with third-party services. Your use of such integrations 
                is subject to those services' terms and conditions. We are not responsible for 
                third-party services and do not endorse or guarantee their performance, security, 
                or availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Elixa shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, or any loss of profits or 
                revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
                or other intangible losses resulting from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are provided "as is" and "as available" without warranties of any kind, 
                either express or implied. We do not warrant that the service will be uninterrupted, 
                error-free, or free of harmful components. Your use of the service is at your sole risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Elixa and its officers, directors, employees, 
                and agents from any claims, damages, losses, liabilities, and expenses arising from 
                your use of the service or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the service at any time, 
                with or without cause, and with or without notice. Upon termination, your right 
                to use the service will immediately cease. Provisions that by their nature should 
                survive termination will survive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of 
                any material changes by posting the new terms on this page. Your continued use of 
                the service after such changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of 
                England and Wales, without regard to its conflict of law provisions. Any disputes 
                arising from these terms or your use of the service shall be subject to the 
                exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@elixa.app" className="text-primary hover:underline">
                  support@elixa.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default Terms;

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for our mobile application',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy. This Privacy Policy explains how our mobile application collects, uses, discloses, and safeguards your information when you use our application.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                <p className="leading-relaxed">
                  We collect information you provide directly, such as your name, email address, phone number, employee ID, and work-related details necessary for the app&apos;s functionality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Device Information</h3>
                <p className="leading-relaxed">
                  We collect device identifiers, device type, operating system, and mobile network information to provide and maintain our services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Location Information</h3>
                <p className="leading-relaxed">
                  With your permission, we collect precise location data to enable attendance tracking and location-based features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Push Notification Tokens</h3>
                <p className="leading-relaxed">
                  We collect push notification tokens from your device to send you timely notifications about attendance, schedules, and other important updates.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our application and services</li>
              <li>To process attendance records and schedule management</li>
              <li>To send push notifications about work schedules and important updates</li>
              <li>To authenticate and verify your identity</li>
              <li>To comply with legal and regulatory requirements</li>
              <li>To monitor and analyze app usage and performance</li>
              <li>To prevent fraud and enhance security</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Service providers who assist us in operating the application</li>
              <li>Authorized company administrators and managers for legitimate business purposes</li>
              <li>Legal authorities when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate data</li>
              <li>The right to delete your personal information</li>
              <li>The right to opt-out of certain data processing</li>
              <li>The right to data portability</li>
            </ul>
          </section>

          {/* Permissions */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. App Permissions</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                Our app requests certain permissions to function properly:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-semibold text-foreground">Location:</span> To track attendance and location-based services</li>
                <li><span className="font-semibold text-foreground">Camera:</span> For photo uploads and profile pictures (if applicable)</li>
                <li><span className="font-semibold text-foreground">Contacts:</span> To facilitate communication features</li>
                <li><span className="font-semibold text-foreground">Storage:</span> To save files and data locally on your device</li>
                <li><span className="font-semibold text-foreground">Notifications:</span> To deliver push notifications</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our application may use third-party services such as analytics and push notification providers. These third parties have their own privacy policies governing their use of information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our application is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information promptly.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us through the app support section or reach out to our support team.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} All rights reserved. This privacy policy is provided for compliance with app store requirements.
          </p>
        </div>
      </div>
    </div>
  )
}

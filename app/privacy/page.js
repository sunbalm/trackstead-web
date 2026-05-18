export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <h1>Privacy Policy</h1>

      <p>
        Trackstead is a personal tracking app for habits, recovery, wellness,
        fitness, finances, and custom progress goals. This policy explains what
        information the app stores and how it is used.
      </p>

      <h2>Information You Provide</h2>
      <p>
        Trackstead may store information you enter into the app, including tracker
        names, start dates, notes, custom fields, milestones, entries, resets,
        and account information such as your email address.
      </p>

      <h2>Sensitive Personal Data</h2>
      <p>
        Some trackers may involve sensitive topics such as addiction recovery,
        health, weight, pornography, substance use, or personal finances. You
        should only enter information you are comfortable storing in your
        account.
      </p>

      <h2>Authentication</h2>
      <p>
        Trackstead uses Firebase Authentication for login and account management.
        Firebase may process login details such as your email address or Google
        account information depending on your chosen sign-in method.
      </p>

      <h2>Storage</h2>
      <p>
        Tracker data is stored in MongoDB Atlas. Your account is linked to your
        Firebase user ID so your trackers can be loaded securely when you log in.
      </p>

      <h2>How Data Is Used</h2>
      <ul>
        <li>To display your dashboard and tracker history.</li>
        <li>To calculate streaks, milestones, statistics, and insights.</li>
        <li>To let you edit, archive, restore, or delete your trackers.</li>
      </ul>

      <h2>Account Deletion</h2>
      <p>
        If you delete your account from the profile page, Trackstead attempts to
        delete your profile, trackers, entries, resets, and Firebase account.
        This action cannot be undone.
      </p>

      <h2>Security</h2>
      <p>
        Trackstead uses authenticated API requests and verifies Firebase ID tokens
        on the server. No system is perfectly secure, so avoid entering
        information that would create serious harm if exposed.
      </p>

      <h2>Medical, Financial, and Legal Disclaimer</h2>
      <p>
        Trackstead is not medical, financial, legal, or mental health advice. The
        app is for personal tracking and reflection only. Contact a qualified
        professional for guidance related to health, addiction, finances, or
        safety.
      </p>

      <h2>Changes</h2>
      <p>
        This policy may be updated as Trackstead changes. Continued use of the
        app means you accept the updated policy.
      </p>
    </main>
  );
}
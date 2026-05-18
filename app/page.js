import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <main className="hero">
        <section className="heroText">
          <h1>Build a clearer path forward.</h1>
          <p>
            Clearwell helps you track habits, recovery, wellness, workouts,
            spending, screen time, weight, calories, and personal progress from
            one calm dashboard.
          </p>

          <div className="heroActions">
            <Link href="/signup" className="button">
              Start Tracking
            </Link>
            <Link href="/login" className="button secondary">
              Login
            </Link>
          </div>
        </section>

        <section className="card previewCard">
          <div className="previewHeader">
            <div className="previewTitle">Today in Clearwell</div>
            <div className="previewBadge">On track</div>
          </div>

          <div className="statGrid">
            <div className="statBox">
              <strong>14d</strong>
              <span>smoke-free</span>
            </div>

            <div className="statBox">
              <strong>$186</strong>
              <span>money saved</span>
            </div>

            <div className="statBox">
              <strong>8</strong>
              <span>workouts logged</span>
            </div>

            <div className="statBox">
              <strong>22h</strong>
              <span>time reclaimed</span>
            </div>
          </div>

          <div className="progressBar">
            <div className="progressFill" />
          </div>
        </section>
      </main>

      <section className="section">
        <h2>Track the parts of life you’re ready to improve.</h2>
        <p className="sectionIntro">
          Use preset trackers for common goals, or create custom trackers with
          your own fields, milestones, logs, and progress history.
        </p>

        <div className="featureGrid">
          <article className="card featureCard">
            <h3>Recovery</h3>
            <p>
              Smoking, alcohol, marijuana, pornography, fast food, gaming,
              social media, and other habits.
            </p>
          </article>

          <article className="card featureCard">
            <h3>Wellness</h3>
            <p>
              Weight, BMI, calories, workouts, steps, miles, sleep, water, mood,
              and health progress.
            </p>
          </article>

          <article className="card featureCard">
            <h3>Money</h3>
            <p>
              Track income, expenses, savings goals, and money reclaimed from
              habits you are changing.
            </p>
          </article>
        </div>
      </section>

      <section className="card homeCtaBand">
        <div>
          <h2>Start with one tracker.</h2>
          <p>
            Add more as your dashboard grows. Clearwell is built to expand with
            your goals.
          </p>
        </div>

        <Link href="/signup" className="button">
          Create Free Account
        </Link>
      </section>
    </>
  );
}
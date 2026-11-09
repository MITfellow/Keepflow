import { CalendarIcon, MailIcon, SendIcon } from "@/components/icons";

export function AgentPanel() {
  return (
    <aside className="agent-panel" aria-label="A glimpse of Rill at work">
      <div className="agent-head">
        <span className="agent-mark" aria-hidden="true">
          r
        </span>
        <span className="agent-title">Rill · your day</span>
        <span className="agent-status">
          <span className="live-dot" aria-hidden="true" />
          Working quietly
        </span>
      </div>

      <ul className="agent-list">
        <li className="agent-row">
          <span className="agent-icon" aria-hidden="true">
            <MailIcon />
          </span>
          <div>
            <p className="agent-row-title">Draft ready · Re: Thursday&rsquo;s call</p>
            <p className="agent-row-detail">In your voice. Calendar checked. No conflicts.</p>
            <div className="agent-progress" aria-hidden="true">
              <span />
            </div>
          </div>
          <span className="agent-tag is-live">Review</span>
        </li>

        <li className="agent-row">
          <span className="agent-icon" aria-hidden="true">
            <CalendarIcon />
          </span>
          <div>
            <p className="agent-row-title">Focus held · Thursday morning</p>
            <p className="agent-row-detail">Two meetings moved. The deep-work block stayed.</p>
          </div>
          <span className="agent-tag">Done</span>
        </li>

        <li className="agent-row">
          <span className="agent-icon" aria-hidden="true">
            <SendIcon />
          </span>
          <div>
            <p className="agent-row-title">Follow-up sent · Intro to Maya</p>
            <p className="agent-row-detail">One nudge, four days after the intro. Thread closed.</p>
          </div>
          <span className="agent-tag">Done</span>
        </li>
      </ul>

      <p className="agent-foot">
        <em>Nothing leaves without you.</em> Draft-and-approve by default.
      </p>
    </aside>
  );
}

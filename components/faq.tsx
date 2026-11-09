const faqs = [
  {
    question: "What is Rill, exactly?",
    answer:
      "A personal AI agent for people building something of their own. It reads the context around your day, drafts replies in your voice, protects focus time, and follows through on the small commitments that usually slip. You stay in charge of what leaves your account.",
  },
  {
    question: "Which accounts will it connect to?",
    answer:
      "Early access begins with Gmail and Google Calendar. We will confirm the full list of supported accounts before your wave opens, and we will not ask you to connect anything you are not comfortable with.",
  },
  {
    question: "Will it send email without asking?",
    answer:
      "Not at first. Early access starts in draft-and-approve mode: Rill prepares the reply, you review it, and you send. As trust builds, you can choose which kinds of messages it may send on its own and set clear limits.",
  },
  {
    question: "What happens to my data?",
    answer:
      "Your messages are processed to do the work you ask for. Rill does not train shared models on your inbox, and does not sell or rent your data. You can export or delete your information, including what the agent remembers, at any time.",
  },
  {
    question: "When does early access open?",
    answer:
      "Invitations go out in waves through spring 2027. Your place on the list sets the order. If you refer friends, your effective position moves up, and three referrals unlock priority onboarding.",
  },
  {
    question: "Do I need to pay to join the list?",
    answer:
      "No. The list is free and joining does not commit you to a plan. We will share pricing before anyone is asked to pay, and early-access members will see it first.",
  },
  {
    question: "Can I leave the list?",
    answer:
      "Yes. Every email includes a one-click unsubscribe link, and you can also use the unsubscribe page. Leaving the waitlist removes you from future waitlist email. It does not affect any account you may create later.",
  },
];

export function Faq() {
  return (
    <div className="faq-list">
      {faqs.map((item) => (
        <details className="faq-item" key={item.question}>
          <summary>
            <span>{item.question}</span>
            <span className="faq-mark" aria-hidden="true" />
          </summary>
          <p className="faq-answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

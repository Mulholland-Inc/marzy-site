// Sample conversations for <mz-mailbox>. The inbox is a 1:1 chat room with
// Marzy (the AI agent): Marzy reaches out proactively, or you chat with it.
// Every thread is between Marzy and You — no other senders, no email metadata.
// Each note: { marzy: true } or { you: true }, a time, and text.

export const MESSAGES = [
  {
    id: "m1",
    subject: "June payroll is drafted and ready for review",
    unread: true,
    time: "9:24 AM",
    thread: [
      { marzy: true, time: "9:24 AM",
        text: "I pulled this week's 14 timesheets from Gusto and drafted the June payroll run. Two entries are above the auto-approve limit, so I've held the batch for you. Everything else reconciles against last month." },
    ],
  },
  {
    id: "m2",
    subject: "Q2 invoices reconciled",
    unread: true,
    time: "8:51 AM",
    thread: [
      { you: true, time: "Yesterday, 4:12 PM",
        text: "Can you take a pass at the Q2 invoices before the board deck? A few from May still look unmatched." },
      { marzy: true, time: "Yesterday, 4:15 PM",
        text: "On it — I matched 38 of 41. The remaining three are missing PO numbers; I've flagged them on the Finance board." },
      { marzy: true, time: "8:51 AM",
        text: "The POs came through overnight, so all 41 now match. Want me to drop the summary into the board deck?" },
    ],
  },
  {
    id: "m3",
    subject: "QuickBooks connection expires in 3 days",
    unread: true,
    time: "7:30 AM",
    thread: [
      { marzy: true, time: "7:30 AM",
        text: "Heads up — your QuickBooks Online connection for Lazarco Inc. expires in 3 days. I can re-authorize it for you so syncing doesn't break. Want me to go ahead?" },
    ],
  },
  {
    id: "m4",
    subject: "Eligibility checks done — Tuesday clinic",
    unread: false,
    time: "Yesterday",
    thread: [
      { marzy: true, time: "Yesterday, 6:02 PM",
        text: "Ran eligibility for all 23 Tuesday appointments. 21 active, 1 needs a secondary payer, 1 termed — I moved both exceptions to the Clinic board and notified the front desk." },
      { you: true, time: "Yesterday, 6:20 PM",
        text: "Great. Did the termed patient get a heads-up?" },
      { marzy: true, time: "Yesterday, 6:21 PM",
        text: "Yes — I drafted a coverage-lapse note for your review before it goes out." },
    ],
  },
  {
    id: "m5",
    subject: "New hire onboarding is set up",
    unread: false,
    time: "Yesterday",
    thread: [
      { you: true, time: "Yesterday, 11:40 AM",
        text: "We've got a new hire starting July 1. Can you get onboarding and payroll ready?" },
      { marzy: true, time: "Yesterday, 11:42 AM",
        text: "Done — I created the onboarding task and pre-filled the Gusto profile. I'll request the I-9 and direct-deposit details a week out." },
    ],
  },
  {
    id: "m6",
    subject: "Sikka sync is healthy again",
    unread: false,
    time: "Mon",
    thread: [
      { marzy: true, time: "Mon, 2:16 PM",
        text: "The Sikka sync timeout is fixed. I watched last night's run end to end — all 1,204 records landed clean and the nightly job is back on schedule." },
    ],
  },
  {
    id: "m7",
    subject: "March books are closed",
    unread: false,
    time: "Mon",
    thread: [
      { marzy: true, time: "Mon, 9:00 AM",
        text: "Closed the March books. Nothing flagged — all accounts reconcile and I've attached the variance report to the Finance board." },
    ],
  },
  {
    id: "m8",
    subject: "Vendor contract sent to legal",
    unread: false,
    time: "Tue",
    thread: [
      { you: true, time: "Tue, 10:05 AM",
        text: "Can you draft the standard vendor contract for the new cleaning service and route it to legal?" },
      { marzy: true, time: "Tue, 10:06 AM",
        text: "Drafted from the standard template with their terms filled in and sent it to legal for review. I'll ping you here when it's signed." },
    ],
  },
];

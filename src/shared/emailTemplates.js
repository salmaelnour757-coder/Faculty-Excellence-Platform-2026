// shared/emailTemplates.js
// Single source of truth for the platform's ready-made email templates —
// used by Settings (Communication settings: browse/edit) and CommCentre
// (compose/send). Institution-specific edits are stored as overrides on
// institutions.comms_settings.templates, keyed by template id, and merged
// over these defaults — never mutate this list itself.

export const EMAIL_TEMPLATES = [
  {
    id: 'invite',
    category: 'Onboarding',
    name: 'Invitation to Join Platform',
    icon: '✉️',
    trigger: 'manual',
    subject: 'You are invited to join {{institution_name}} Faculty Excellence Platform',
    body: `Dear {{to_name}},

You have been invited to join the Faculty Excellence Platform at {{institution_name}} by {{from_name}}.

Your role: {{role}}
Department: {{department}}
College: {{college}}

Click the link below to accept your invitation and create your password:

{{invite_link}}

This invitation expires in 7 days.`,
  },
  {
    id: 'welcome',
    category: 'Onboarding',
    name: 'Welcome & Registration Confirmation',
    icon: '👋',
    trigger: 'automatic',
    subject: 'Welcome to {{institution_name}} Faculty Excellence Platform',
    body: `Dear {{to_name}},

Welcome to the Faculty Excellence Platform at {{institution_name}}.

Your account has been successfully created.

Role: {{role}}
Department: {{department}}

You can log in at: {{platform_url}}

We look forward to supporting your professional development journey.`,
  },
  {
    id: 'assessment_open',
    category: 'Assessment',
    name: 'Assessment Cycle Opened',
    icon: '📋',
    trigger: 'manual',
    subject: 'Your annual needs assessment is now open — {{institution_name}}',
    body: `Dear {{to_name}},

Your annual faculty competency needs assessment is now open.

Please complete your assessment by {{due_date}}.

The assessment takes approximately 20 minutes and covers 9 competency domains.

Your responses are completely confidential and are not linked to your performance appraisal.

Log in to complete your assessment: {{platform_url}}`,
  },
  {
    id: 'assessment_reminder',
    category: 'Assessment',
    name: 'Assessment Reminder',
    icon: '⏰',
    trigger: 'automatic',
    subject: 'Reminder: Your assessment is due in 7 days — {{institution_name}}',
    body: `Dear {{to_name}},

This is a reminder that your faculty competency needs assessment is due in 7 days.

Due date: {{due_date}}

Please log in to complete your assessment: {{platform_url}}`,
  },
  {
    id: 'assessment_complete',
    category: 'Assessment',
    name: 'Assessment Completed',
    icon: '✅',
    trigger: 'automatic',
    subject: 'Assessment complete — your IDP is ready',
    body: `Dear {{to_name}},

Thank you for completing your faculty competency needs assessment.

Your Individual Development Plan (IDP) has been generated and is ready to view.

Log in to view your IDP and recommended pathways: {{platform_url}}`,
  },
  {
    id: 'idp_approved',
    category: 'Assessment',
    name: 'IDP Approved by Supervisor',
    icon: '🗺️',
    trigger: 'automatic',
    subject: 'Your IDP has been approved — {{institution_name}}',
    body: `Dear {{to_name}},

Your Individual Development Plan has been reviewed and approved by your supervisor.

You can now enrol in your recommended learning pathways.

Log in to view your approved IDP: {{platform_url}}`,
  },
  {
    id: 'workshop_registration',
    category: 'Workshops',
    name: 'Workshop Registration Confirmation',
    icon: '📅',
    trigger: 'automatic',
    subject: 'Workshop registration confirmed — {{workshop_name}}',
    body: `Dear {{to_name}},

Your registration for the following workshop has been confirmed:

Workshop: {{workshop_name}}
Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}
Facilitator: {{facilitator_name}}
CPD Credits: {{cpd_credits}}

Please add this to your calendar. If you are unable to attend, please notify us at least 48 hours in advance.`,
  },
  {
    id: 'workshop_reminder',
    category: 'Workshops',
    name: 'Workshop Reminder',
    icon: '🔔',
    trigger: 'automatic',
    subject: 'Reminder: {{workshop_name}} is tomorrow',
    body: `Dear {{to_name}},

This is a reminder that you are registered for the following workshop tomorrow:

Workshop: {{workshop_name}}
Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}

We look forward to seeing you there.`,
  },
  {
    id: 'workshop_missed',
    category: 'Workshops',
    name: 'Missed Workshop Alert',
    icon: '⚠️',
    trigger: 'manual',
    subject: 'You missed a workshop session — {{workshop_name}}',
    body: `Dear {{to_name}},

Our records show that you were unable to attend the following workshop session:

Workshop: {{workshop_name}}
Date: {{workshop_date}}

This session is part of your approved Individual Development Plan.

Please contact your supervisor or the Faculty Development team to discuss rescheduling.`,
  },
  {
    id: 'certificate_issued',
    category: 'Certificates',
    name: 'Certificate Issued',
    icon: '🏆',
    trigger: 'automatic',
    subject: 'Congratulations — your certificate has been issued',
    body: `Dear {{to_name}},

Congratulations on completing {{pathway_name}}.

Your certificate has been issued:

Certificate: {{certificate_title}}
CPD Credits: {{cpd_credits}}
Date Issued: {{issue_date}}
Verification Code: {{verification_code}}

You can download your certificate and view your updated CPD record by logging into the platform: {{platform_url}}`,
  },
  {
    id: 'pathway_enrolled',
    category: 'Pathways',
    name: 'Pathway Enrolment Confirmation',
    icon: '🎓',
    trigger: 'automatic',
    subject: 'Enrolment confirmed — {{pathway_name}}',
    body: `Dear {{to_name}},

Your enrolment in the following learning pathway has been confirmed:

Pathway: {{pathway_name}}
CPD Credits: {{cpd_credits}}
Duration: {{duration_hours}} hours

Log in to view your pathway details and get started: {{platform_url}}`,
  },
  {
    id: 'assessment_overdue',
    category: 'Alerts',
    name: 'Assessment Overdue Alert',
    icon: '🚨',
    trigger: 'automatic',
    subject: 'Action required — assessment overdue',
    body: `Dear {{to_name}},

Your faculty competency needs assessment is now overdue.

Due date: {{due_date}}

Please complete your assessment as soon as possible. If you are experiencing difficulties, please contact your department chair.

Log in here: {{platform_url}}`,
  },
  {
    id: 'mentor_reminder',
    category: 'Mentoring',
    name: 'Mentor Meeting Reminder',
    icon: '🤝',
    trigger: 'automatic',
    subject: 'Mentoring session reminder — {{institution_name}}',
    body: `Dear {{to_name}},

This is a reminder that you have a mentoring session scheduled with {{mentor_name}}.

Date: {{meeting_date}}
Time: {{meeting_time}}

Please ensure your mentoring log is up to date before the session.`,
  },
]

export const TEMPLATE_CATEGORIES = ['All', 'Onboarding', 'Assessment', 'Workshops', 'Certificates', 'Pathways', 'Alerts', 'Mentoring']

// Merges an institution's saved overrides (comms_settings.templates, keyed by
// template id) over the shipped defaults. Templates with no override fall
// back untouched; overrides only ever replace subject/body, never id/icon/
// category/trigger, so filtering and icons stay stable even if an admin
// edits the wording.
export function withOverrides(overrides) {
  if (!overrides) return EMAIL_TEMPLATES
  return EMAIL_TEMPLATES.map(t => overrides[t.id] ? { ...t, ...overrides[t.id] } : t)
}

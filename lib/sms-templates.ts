export const smsTemplates = {

  // Auth
  welcomeNew: (name: string) =>
    `Welcome to RealX World, ${name}! Browse verified properties across Nigeria at realxworld.net`,

  emailVerified: (name: string) =>
    `Hi ${name}, your RealX World account is now verified. You can list properties at realxworld.net`,

  // Listings
  listingApproved: (title: string) =>
    `Your listing "${title.slice(0, 40)}" is now live on RealX World. Buyers can see it at realxworld.net`,

  listingRejected: (title: string) =>
    `Your RealX World listing "${title.slice(0, 30)}" was not approved. Log in to review and resubmit.`,

  // Enquiries
  newEnquiry: (listingTitle: string) =>
    `New enquiry on "${listingTitle.slice(0, 35)}" on RealX World. Log in to reply: realxworld.net/dashboard/enquiries`,

  enquiryReply: (sellerName: string) =>
    `${sellerName.slice(0, 20)} replied to your RealX World enquiry. View it: realxworld.net/dashboard/enquiries`,

  // KYC
  kycVerified: (name: string) =>
    `Hi ${name}, your identity is verified on RealX World. You can now list properties at realxworld.net`,

  kycFailed: (name: string) =>
    `Hi ${name}, your RealX World identity verification was unsuccessful. Please try again: realxworld.net/dashboard/kyc`,

  // Professionals
  professionalApproved: (name: string) =>
    `Hi ${name}, your professional profile is approved on RealX World. You are now in our directory.`,

  professionalRejected: (name: string) =>
    `Hi ${name}, your RealX World professional profile was not approved. Please update and resubmit.`,

  // Vendors
  vendorApproved: (businessName: string) =>
    `${businessName.slice(0, 30)} is now an approved vendor on RealX World Marketplace. Start listing at realxworld.net`,

  vendorRejected: (businessName: string) =>
    `Your RealX World vendor application for ${businessName.slice(0, 25)} was not approved. Please resubmit.`,

  // Role upgrade
  roleUpgradeApproved: (name: string) =>
    `Hi ${name}, your seller account is now active on RealX World. List your first property at realxworld.net`,

  roleUpgradeRejected: (name: string) =>
    `Hi ${name}, your RealX World seller request was not approved. Check your dashboard for details.`,

  // Rent reminders (Phase 3 — for future use)
  rentDueSoon: (propertyTitle: string, daysUntilDue: number) =>
    `Reminder: Rent for "${propertyTitle.slice(0, 30)}" is due in ${daysUntilDue} days. Log in to RealX World to manage.`,

  rentOverdue: (propertyTitle: string) =>
    `URGENT: Rent for "${propertyTitle.slice(0, 30)}" is overdue. Please contact your landlord via RealX World.`,
};

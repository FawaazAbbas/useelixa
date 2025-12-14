// Google Analytics event tracking utility

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

type EventCategory = 
  | 'engagement'
  | 'conversion'
  | 'navigation'
  | 'search'
  | 'form'
  | 'agent'
  | 'pitch_deck'
  | 'button'
  | 'popup'
  | 'workspace';

interface TrackEventParams {
  action: string;
  category: EventCategory;
  label?: string;
  value?: number;
}

export const trackEvent = ({ action, category, label, value }: TrackEventParams): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Button click tracking
export const trackButtonClick = (buttonText: string, location: string): void => {
  trackEvent({
    action: 'button_click',
    category: 'button',
    label: `${location}: ${buttonText}`,
  });
};

// Popup tracking
export const trackWaitlistPopupView = (trigger: 'auto' | 'manual'): void => {
  trackEvent({
    action: 'waitlist_popup_view',
    category: 'popup',
    label: trigger,
  });
};

export const trackWaitlistPopupClose = (step: number): void => {
  trackEvent({
    action: 'waitlist_popup_close',
    category: 'popup',
    label: `closed_at_step_${step}`,
    value: step,
  });
};

export const trackWaitlistStep1Complete = (): void => {
  trackEvent({
    action: 'waitlist_step1_complete',
    category: 'conversion',
  });
};

export const trackWaitlistStep2Complete = (): void => {
  trackEvent({
    action: 'waitlist_step2_complete',
    category: 'conversion',
  });
};

// Workspace tracking
export const trackWorkspaceView = (section: string): void => {
  trackEvent({
    action: 'workspace_view',
    category: 'workspace',
    label: section,
  });
};

export const trackWorkspaceChatOpen = (chatType: string, chatName: string): void => {
  trackEvent({
    action: 'workspace_chat_open',
    category: 'workspace',
    label: `${chatType}: ${chatName}`,
  });
};

export const trackWorkspaceMessageSent = (chatType: string): void => {
  trackEvent({
    action: 'workspace_message_sent',
    category: 'workspace',
    label: chatType,
  });
};

export const trackWorkspaceFeatureClick = (feature: string): void => {
  trackEvent({
    action: 'workspace_feature_click',
    category: 'workspace',
    label: feature,
  });
};

// Pre-defined tracking functions for common events

// Form submissions
export const trackWaitlistSignup = (email: string): void => {
  trackEvent({
    action: 'waitlist_signup',
    category: 'conversion',
    label: email.split('@')[1], // Track domain only for privacy
  });
};

export const trackDeveloperApplication = (): void => {
  trackEvent({
    action: 'developer_application',
    category: 'conversion',
  });
};

export const trackContactSubmission = (subject: string): void => {
  trackEvent({
    action: 'contact_form_submit',
    category: 'form',
    label: subject,
  });
};

// Agent interactions
export const trackAgentView = (agentName: string, agentCategory: string): void => {
  trackEvent({
    action: 'agent_view',
    category: 'agent',
    label: `${agentCategory}: ${agentName}`,
  });
};

export const trackAgentInstallClick = (agentName: string): void => {
  trackEvent({
    action: 'agent_install_click',
    category: 'agent',
    label: agentName,
  });
};

// Search interactions
export const trackSearch = (searchTerm: string, resultsCount: number): void => {
  trackEvent({
    action: 'search',
    category: 'search',
    label: searchTerm,
    value: resultsCount,
  });
};

export const trackCategoryFilter = (category: string): void => {
  trackEvent({
    action: 'category_filter',
    category: 'search',
    label: category,
  });
};

// Navigation
export const trackNavClick = (destination: string): void => {
  trackEvent({
    action: 'nav_click',
    category: 'navigation',
    label: destination,
  });
};

export const trackFooterClick = (linkName: string): void => {
  trackEvent({
    action: 'footer_click',
    category: 'navigation',
    label: linkName,
  });
};

// CTA buttons
export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent({
    action: 'cta_click',
    category: 'engagement',
    label: `${location}: ${ctaName}`,
  });
};

// Pitch deck
export const trackPitchDeckSlide = (slideNumber: number, slideTitle: string): void => {
  trackEvent({
    action: 'pitch_deck_slide_view',
    category: 'pitch_deck',
    label: slideTitle,
    value: slideNumber,
  });
};

export const trackPitchDeckComplete = (): void => {
  trackEvent({
    action: 'pitch_deck_complete',
    category: 'pitch_deck',
  });
};

// Page views (for SPA navigation)
export const trackPageView = (pagePath: string, pageTitle: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

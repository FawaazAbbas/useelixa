export interface MockProfile {
  id: string;
  display_name: string;
  email: string;
  bio: string;
  avatar_url: string | null;
}

export const mockProfile: MockProfile = {
  id: "demo-user-123",
  display_name: "Liam Baduss",
  email: "Liam@badusstechnologies.com",
  bio: "CEO of Baduss Technologies. Exploring Elixa's powerful AI automation capabilities.",
  avatar_url: null,
};

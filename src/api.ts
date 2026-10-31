const API_URL = "https://inai-col2.fishrungames.com";

export type Specialization =
  | "vocals"
  | "guitar"
  | "bass"
  | "drums"
  | "keys"
  | "other";

export interface SpecializationChoice {
  value: Specialization;
  label: string;
}

export interface Profile {
  first_name: string;
  specialization: Specialization | null;
  specialization_display: string;
  bio: string;
  fee: number | string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  profile: Profile;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : `Ошибка сервера: ${response.status}`,
    );
  }

  return data as T;
}

export const api = {
  register(username: string, password: string) {
    return request<UserProfile>("/api/register/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  login(username: string, password: string) {
    return request<UserProfile>("/api/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  logout() {
    return request<unknown>("/api/logout/", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getProfile() {
    return request<UserProfile>("/api/profile/");
  },

  updateProfile(profile: Partial<Profile>) {
    return request<UserProfile>("/api/profile/", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  },

  getSpecializations() {
    return request<SpecializationChoice[]>(
      "/api/specializations/",
    );
  },
};
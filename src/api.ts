const API_URL = "https://inai-col3.fishrungames.com";

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

interface AuthResponse {
  access: string;
  user: UserProfile;
}

interface RefreshResponse {
  access: string;
}

let accessToken: string | null = null;

function saveAccessToken(token: string) {
  accessToken = token;
}

function clearAccessToken() {
  accessToken = null;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/api/token/refresh/`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!response.ok) {
      clearAccessToken();
      return false;
    }

    const data: RefreshResponse = await response.json();

    if (!data.access) {
      clearAccessToken();
      return false;
    }

    saveAccessToken(data.access);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
  useAuth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (useAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request<T>(path, options, false, useAuth);
    }
  }

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      `Ошибка сервера: ${response.status}`,
    );
  }

  return data as T;
}

async function authenticate(
  path: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>(
    path,
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
    false,
  );

  saveAccessToken(data.access);

  return data;
}

export const api = {
  register(username: string, password: string) {
    return authenticate(
      "/api/register/",
      username,
      password,
    );
  },

  login(username: string, password: string) {
    return authenticate(
      "/api/login/",
      username,
      password,
    );
  },

  async logout() {
    try {
      return await request(
        "/api/logout/",
        {
          method: "POST",
        },
        false,
      );
    } finally {
      clearAccessToken();
    }
  },

  getProfile() {
    return request<UserProfile>("/api/profile/");
  },

  updateProfile(profile: Partial<Profile>) {
    return request<UserProfile>(
      "/api/profile/",
      {
        method: "PATCH",
        body: JSON.stringify(profile),
      },
    );
  },

  getSpecializations() {
    return request<SpecializationChoice[]>(
      "/api/specializations/",
    );
  },
};
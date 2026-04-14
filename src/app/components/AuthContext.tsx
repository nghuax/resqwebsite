import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { refreshResQStore, setResQStoreScope } from "./resqStore";
import {
  buildAuthUser,
  formatAuthError,
  type ResQAuthRole,
  type ResQAuthUser,
  syncProfile,
} from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client";

type LoginInput = {
  email: string;
  password: string;
  role: ResQAuthRole;
};

type RegisterInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: ResQAuthRole;
};

type AuthResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
  user?: ResQAuthUser | null;
};

type AuthContextValue = {
  user: ResQAuthUser | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRoleMismatchMessage(role: ResQAuthRole) {
  if (role === "fixer") {
    return "Tài khoản này chưa được cấu hình ở vai trò fixer.";
  }

  return "Tài khoản này hiện đang thuộc vai trò fixer. Hãy chọn đúng chế độ đăng nhập.";
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ResQAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);

      if (!nextSession?.user) {
        setUser(null);
        setResQStoreScope(null);
        setIsLoading(false);
        return;
      }

      const nextUser = await buildAuthUser(nextSession.user);

      if (!isActive) {
        return;
      }

      setUser(nextUser);
      setResQStoreScope(nextUser);
      void refreshResQStore(nextUser);
      setIsLoading(false);
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session ?? null))
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSession(null);
        setUser(null);
        setResQStoreScope(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void refreshResQStore(user);

    const intervalId = window.setInterval(() => {
      void refreshResQStore(user);
    }, 12000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user]);

  const login = useCallback(async ({ email, password, role }: LoginInput) => {
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setIsLoading(false);
      return { error: formatAuthError(error.message) };
    }

    const authUser = data.user
      ? await buildAuthUser(data.user)
      : data.session?.user
        ? await buildAuthUser(data.session.user)
        : null;

    if (authUser && authUser.role !== role) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setResQStoreScope(null);
      setIsLoading(false);
      return { error: getRoleMismatchMessage(role) };
    }

    setSession(data.session ?? null);
    setUser(authUser);
    setResQStoreScope(authUser);
    setIsLoading(false);

    return { user: authUser };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setIsLoading(true);

    const supabase = createClient();
    const normalizedEmail = input.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          full_name: input.name.trim(),
          phone: input.phone.trim(),
          role: input.role,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      return { error: formatAuthError(error.message) };
    }

    if (data.user) {
      await syncProfile(data.user, {
        name: input.name,
        phone: input.phone,
        email: normalizedEmail,
        role: input.role,
      });
    }

    const authUser = data.session?.user
      ? await buildAuthUser(data.session.user)
      : null;

    setSession(data.session ?? null);
    setUser(authUser);
    setResQStoreScope(authUser);
    setIsLoading(false);

    return {
      user: authUser,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await createClient().auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setResQStoreScope(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoggedIn: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, session, user, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

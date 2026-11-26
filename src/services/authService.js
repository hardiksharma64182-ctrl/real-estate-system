import { getSupabaseClient } from './supabaseClient';

const CURRENT_USER_KEY = 'lux_current_user';
const FAVORITES_KEY = 'lux_customer_favorites';
export const authService = {
  /**
   * Fetch user profile from Supabase with retry logic to handle
   * session propagation delay immediately after signInWithPassword.
   * @private
   */
  async _fetchProfile(supabase, userId, maxRetries = 3) {
    const RETRY_DELAY_MS = 400;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle returns null instead of error when no row found

      if (error) {
        // PGRST116 = no rows, treat the same as null profile
        if (error.code === 'PGRST116') {
          return { profile: null, error: null };
        }
        lastError = error;
        console.warn(`Profile fetch attempt ${attempt} failed:`, error.message);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
        continue;
      }

      return { profile, error: null };
    }

    return { profile: null, error: lastError };
  },

  /**
   * Secure Sign In with Database Role Verification
   * Fetches role exclusively from public.profiles â€” never trusts user_metadata.role.
   * @param {string} email
   * @param {string} password
   * @param {'admin'|'agent'|'customer'} requiredRole
   */
  async signIn(email, password, requiredRole) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const supabase = getSupabaseClient();
    if (supabase) {
      // â”€â”€ Step 1: Authenticate with Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      let authData, authError;
      try {
        const result = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        authData = result.data;
        authError = result.error;
      } catch (err) {
        throw new Error(err.message || 'Authentication service error. Please try again.');
      }

      if (authError) {
        // Map Supabase's generic message to something human-readable
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Incorrect email or password. Please verify your credentials.');
        }
        throw new Error(authError.message);
      }

      if (!authData?.user) {
        throw new Error('Authentication failed: no user session returned. Please try again.');
      }

      const user = authData.user;

      // â”€â”€ Step 2: Fetch role from profiles table (with retries) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // IMPORTANT: We NEVER read role from user_metadata â€” it is set to 'customer'
      // for all signups and cannot be trusted for admin/agent detection.
      const { profile, error: profileErr } = await this._fetchProfile(supabase, user.id);

      if (profileErr) {
        // Profile query hard-failed â€” sign out and report clearly
        await supabase.auth.signOut();
        console.error('Profile fetch error after retries:', profileErr);
        throw new Error(
          'Could not verify your account profile. This may be a temporary database issue. ' +
          'Please try again in a moment, or contact support if this persists.'
        );
      }

      if (!profile) {
        // User exists in auth.users but has no profiles row yet.
        // This can happen if the handle_new_user trigger hasn't run yet.
        await supabase.auth.signOut();
        throw new Error(
          'Your account profile was not found. ' +
          'If you just registered, please wait a moment and try again. ' +
          'Contact your system administrator if this issue persists.'
        );
      }

      // â”€â”€ Step 3: Enforce portal role boundary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const userRole = profile.role; // Always read from DB, never from metadata

      if (requiredRole && userRole !== requiredRole) {
        await supabase.auth.signOut();
        const portal = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1);
        const actualPortal = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        throw new Error(
          `Access Denied: Your account role is "${userRole}". ` +
          `Please log in via the ${actualPortal} Portal instead of the ${portal} Portal.`
        );
      }

      // â”€â”€ Step 4: Build and persist session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const authenticatedUser = {
        id: user.id,
        email: user.email,
        name: profile.name || user.email.split('@')[0],
        role: userRole,
        avatar:
          profile.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone: profile.phone || '',
        title: profile.title || '',
        address: profile.address || '',
        budget_range: profile.budget_range || '$1M - $3M',
        agent_id: profile.agent_id || null,
        customer_id: profile.customer_id || null,
        owner_id: profile.owner_id || null,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
      return authenticatedUser;
    }

    throw new Error(
      'Supabase is not configured. Please configure your Supabase URL and publishable/anon key.'
    );
  },

  /**
   * Register a new Customer in the database
   */
  async registerCustomer(data) {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password.trim();

    if (cleanPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          name: data.name,
          role: 'customer',
          phone: data.phone || '',
        },
      },
    });

    if (authErr) {
      throw new Error(authErr.message);
    }

    if (!authData.user) {
      throw new Error('Registration could not be completed. Please try again.');
    }

    if (!authData.session) {
      return {
        id: authData.user.id,
        email: authData.user.email,
        name: data.name,
        role: 'customer',
        requiresEmailConfirmation: true,
      };
    }

    const { profile, error: profileErr } = await this._fetchProfile(
      supabase,
      authData.user.id
    );

    if (profileErr || !profile) {
      await supabase.auth.signOut();
      throw new Error('Account created, but profile verification failed. Please contact support.');
    }

    const registeredUser = {
      id: authData.user.id,
      email: authData.user.email,
      name: profile.name || data.name,
      role: profile.role,
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      address: profile.address || '',
      budget_range: profile.budget_range || '',
      customer_id: profile.customer_id || null,
        owner_id: profile.owner_id || null,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(registeredUser));
    return registeredUser;
  },

  /**
   * Password Reset Flow
   */
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: 'https://real-estate-system-nine.vercel.app/reset-password',
    });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: 'If an account exists for this email, a password reset link will be sent.',
    };
  },
  /**
   * Get current user from localStorage (synchronous, used for initial render).
   * Always call refreshSessionFromSupabase() on app mount to verify the session
   * is still valid and re-fetch the latest role from the database.
   */
  async updatePassword(newPassword) {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  },
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Re-verify active Supabase session and refresh profile role from the database.
   * Call this once on app startup in AppContext. Returns the refreshed user or null.
   * Does NOT throw â€” always resolves so the app can continue loading.
   */
  async refreshSessionFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return this.getCurrentUser();

    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr || !sessionData?.session?.user) {
        // No valid Supabase session â€” clear any stale localStorage user
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      const user = sessionData.session.user;

      // Re-fetch the latest profile to pick up any role changes
      const { profile } = await this._fetchProfile(supabase, user.id, 2);

      if (!profile) {
        // Profile missing â€” clear session and return null
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      const refreshedUser = {
        id: user.id,
        email: user.email,
        name: profile.name || user.email.split('@')[0],
        role: profile.role,
        avatar:
          profile.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone: profile.phone || '',
        title: profile.title || '',
        address: profile.address || '',
        budget_range: profile.budget_range || '$1M - $3M',
        agent_id: profile.agent_id || null,
        customer_id: profile.customer_id || null,
        owner_id: profile.owner_id || null,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(refreshedUser));
      return refreshedUser;
    } catch (err) {
      // Network or unexpected error â€” keep existing localStorage user to avoid
      // logging the user out on a temporary connectivity issue
      console.warn('Session refresh failed, using cached session:', err.message);
      return this.getCurrentUser();
    }
  },

  /**
   * Sign Out
   */
  async signOut() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // ===================== CUSTOMER FAVOURITES =====================
  getFavorites(customerId) {
    try {
      const raw = localStorage.getItem(`${FAVORITES_KEY}_${customerId}`);
      return raw ? JSON.parse(raw) : []; // initial sample favorites
    } catch {
      return [];
    }
  },

  toggleFavorite(customerId, propertyId) {
    try {
      const current = this.getFavorites(customerId);
      let updated;
      if (current.includes(propertyId)) {
        updated = current.filter((id) => id !== propertyId);
      } else {
        updated = [...current, propertyId];
      }
      localStorage.setItem(`${FAVORITES_KEY}_${customerId}`, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },
};









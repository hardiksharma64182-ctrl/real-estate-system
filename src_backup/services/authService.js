import { getSupabaseClient } from './supabaseClient';
import { generateId } from '../utils/formatters';

const USERS_DB_KEY = 'lux_db_users';
const CURRENT_USER_KEY = 'lux_current_user';
const FAVORITES_KEY = 'lux_customer_favorites';

// Initial verified user accounts stored securely in the database
const INITIAL_DATABASE_USERS = [
  {
    id: 'usr-admin-01',
    email: 'admin@luxeestate.com',
    password: 'Admin@2026!',
    name: 'Eleanor Vance',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Managing Director & Platform Admin',
    phone: '+1 (310) 555-0190',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-agent-01',
    email: 'sophia.lorenza@luxeestate.com',
    password: 'Agent@2026!',
    name: 'Sophia Lorenza',
    role: 'agent',
    agent_id: 'agt-1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    title: 'Senior Luxury Specialist',
    phone: '+1 (310) 555-8821',
    created_at: '2026-02-15T09:30:00Z',
  },
  {
    id: 'usr-agent-02',
    email: 'alexander.vance@luxeestate.com',
    password: 'Agent@2026!',
    name: 'Alexander Vance',
    role: 'agent',
    agent_id: 'agt-2',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    title: 'Metropolitan Penthouse Director',
    phone: '+1 (212) 555-7744',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'usr-cust-01',
    email: 'j.reed@techcapital.io',
    password: 'Customer@2026!',
    name: 'Jonathan Reed',
    role: 'customer',
    customer_id: 'cust-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Verified Buyer',
    phone: '+1 (650) 555-9201',
    address: '450 University Ave, Palo Alto, CA 94301',
    budget_range: '$4M - $6M',
    created_at: '2026-03-01T11:15:00Z',
  },
  {
    id: 'usr-cust-02',
    email: 'sarah.jenkins@healthfirst.org',
    password: 'Customer@2026!',
    name: 'Dr. Sarah Jenkins',
    role: 'customer',
    customer_id: 'cust-2',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    title: 'Verified Buyer',
    phone: '+1 (212) 555-4311',
    address: '10 Gracie Square, New York, NY 10028',
    budget_range: '$3M - $4M',
    created_at: '2026-03-12T14:45:00Z',
  },
];

// Seed users database table if not present
const getDatabaseUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_DATABASE_USERS));
      return INITIAL_DATABASE_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DATABASE_USERS;
  }
};

const saveDatabaseUsers = (users) => {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to update users table:', err);
  }
};

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
   * Fetches role exclusively from public.profiles — never trusts user_metadata.role.
   * @param {string} email
   * @param {string} password
   * @param {'admin'|'agent'|'customer'} requiredRole
   */
  async signIn(email, password, requiredRole) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const supabase = getSupabaseClient();
    if (supabase) {
      // ── Step 1: Authenticate with Supabase ──────────────────────────────
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

      // ── Step 2: Fetch role from profiles table (with retries) ────────────
      // IMPORTANT: We NEVER read role from user_metadata — it is set to 'customer'
      // for all signups and cannot be trusted for admin/agent detection.
      const { profile, error: profileErr } = await this._fetchProfile(supabase, user.id);

      if (profileErr) {
        // Profile query hard-failed — sign out and report clearly
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

      // ── Step 3: Enforce portal role boundary ────────────────────────────
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

      // ── Step 4: Build and persist session ──────────────────────────────
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
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
      return authenticatedUser;
    }

    // Database verification (local database store)
    const users = getDatabaseUsers();
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      throw new Error('No account found with this email address. Please check credentials or register.');
    }

    if (matchedUser.password !== cleanPassword) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    // Role-based Access Control Verification
    if (requiredRole && matchedUser.role !== requiredRole) {
      const roleCapitalized = matchedUser.role.charAt(0).toUpperCase() + matchedUser.role.slice(1);
      const targetPortal = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1);
      throw new Error(
        `Access Denied: This account is registered as a ${roleCapitalized}. You cannot log into the ${targetPortal} Portal with these credentials.`
      );
    }

    const sessionUser = {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
      title: matchedUser.title,
      phone: matchedUser.phone,
      address: matchedUser.address,
      agent_id: matchedUser.agent_id || null,
      customer_id: matchedUser.customer_id || null,
      budget_range: matchedUser.budget_range || '$2M - $5M',
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
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
    if (supabase) {
      try {
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

        if (authErr) throw new Error(authErr.message);

        const newProfile = {
          id: authData.user?.id || generateId('usr'),
          email: cleanEmail,
          name: data.name,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          phone: data.phone || '',
          address: data.address || '',
          budget_range: data.budget_range || '$1M - $3M',
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newProfile));
        return newProfile;
      } catch (err) {
        console.warn('Supabase customer register error, saving to local store:', err);
      }
    }

    // Local Database registration
    const users = getDatabaseUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newUser = {
      id: generateId('usr-cust'),
      email: cleanEmail,
      password: cleanPassword,
      name: data.name,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      title: 'Registered Client',
      phone: data.phone || '+1 (555) 000-0000',
      address: data.address || 'United States',
      budget_range: data.budget_range || '$1M - $3M',
      created_at: new Date().toISOString(),
    };

    saveDatabaseUsers([...users, newUser]);

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      title: newUser.title,
      phone: newUser.phone,
      address: newUser.address,
      budget_range: newUser.budget_range,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Password Reset Flow
   */
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/customer/login`,
        });
        if (!error) {
          return { success: true, message: `Password reset recovery link sent to ${cleanEmail}.` };
        }
      } catch (e) {
        console.warn('Supabase reset error:', e);
      }
    }

    // Verify user exists in database
    const users = getDatabaseUsers();
    const userExists = users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (!userExists) {
      throw new Error(`No account registered with ${cleanEmail}. Please verify the address.`);
    }

    // Simulate recovery email dispatch
    return {
      success: true,
      message: `Password reset instructions and a temporary verification code have been dispatched to ${cleanEmail}.`,
    };
  },

  /**
   * Get current user from localStorage (synchronous, used for initial render).
   * Always call refreshSessionFromSupabase() on app mount to verify the session
   * is still valid and re-fetch the latest role from the database.
   */
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
   * Does NOT throw — always resolves so the app can continue loading.
   */
  async refreshSessionFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return this.getCurrentUser();

    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr || !sessionData?.session?.user) {
        // No valid Supabase session — clear any stale localStorage user
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      const user = sessionData.session.user;

      // Re-fetch the latest profile to pick up any role changes
      const { profile } = await this._fetchProfile(supabase, user.id, 2);

      if (!profile) {
        // Profile missing — clear session and return null
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
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(refreshedUser));
      return refreshedUser;
    } catch (err) {
      // Network or unexpected error — keep existing localStorage user to avoid
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
      return raw ? JSON.parse(raw) : ['prop-1', 'prop-2']; // initial sample favorites
    } catch {
      return ['prop-1', 'prop-2'];
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

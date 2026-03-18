import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabase';

export default function LoginPage() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '4rem auto',
    }}>
      <h1>Leveled</h1>
      <p style={{
        color: 'var(--color-text-secondary)',
        marginBottom: '2rem',
        fontSize: '0.95rem',
      }}>
        Personal job prep tracker. Sign in to continue.
      </p>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github']}
        redirectTo={window.location.origin}
        view="sign_up"
      />
    </div>
  );
}

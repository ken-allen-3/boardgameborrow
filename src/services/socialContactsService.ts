import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SocialContact {
  name: string;
  email: string;
  source: 'google' | 'facebook';
  photoUrl?: string;
}

export function useGoogleContacts() {
  const { googleAccessToken, signInWithGoogle } = useAuth();
  
  const fetchContacts = React.useCallback(async (): Promise<SocialContact[]> => {
    if (!googleAccessToken) {
      throw new Error('Please sign in with Google to access your contacts.');
    }

    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me/connections' +
        '?personFields=names,emailAddresses,photos' +
        '&pageSize=100',
        {
          headers: {
            'Authorization': `Bearer ${googleAccessToken}`,
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        // For 403/401, we need to re-authenticate
        if (response.status === 403 || response.status === 401) {
          // Instead of throwing an error, we'll return an empty array
          // The UI can handle showing a "Sign in again" button
          return [];
        }
        throw new Error('Failed to load contacts. Please try again.');
      }

      const data = await response.json();
      return (data.connections || [])
        .filter((contact: any) => contact.emailAddresses?.[0]?.value)
        .map((contact: any) => ({
          name: contact.names?.[0]?.displayName || '',
          email: contact.emailAddresses[0].value,
          source: 'google' as const,
          photoUrl: contact.photos?.[0]?.url
        }));
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
      return []; // Return empty array instead of throwing
    }
  }, [googleAccessToken]);

  return { fetchContacts };
}

export function useFacebookContacts() {
  const { currentUser } = useAuth();
  
  const fetchContacts = React.useCallback(async (): Promise<SocialContact[]> => {
    if (!currentUser) {
      return []; // Return empty array instead of throwing
    }

    try {
      const response = await fetch(
        'https://graph.facebook.com/v18.0/me/friends?fields=name,email',
        {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        }
      );

      if (!response.ok) {
        return []; // Return empty array instead of throwing
      }

      const data = await response.json();
      return (data.data || [])
        .filter((friend: any) => friend.email)
        .map((friend: any) => ({
          name: friend.name,
          email: friend.email,
          source: 'facebook' as const,
          photoUrl: `https://graph.facebook.com/${friend.id}/picture?type=square`
        }));
    } catch (error) {
      console.error('Error fetching Facebook contacts:', error);
      return []; // Return empty array instead of throwing
    }
  }, [currentUser]);

  return { fetchContacts };
}

export function useSocialContacts() {
  const { currentUser } = useAuth();
  const { fetchContacts: fetchGoogleContacts } = useGoogleContacts();
  const { fetchContacts: fetchFacebookContacts } = useFacebookContacts();

  const fetchContacts = React.useCallback(async (): Promise<SocialContact[]> => {
    if (!currentUser) {
      return [];
    }

    const provider = currentUser.providerData[0]?.providerId;
    switch (provider) {
      case 'google.com':
        return fetchGoogleContacts();
      case 'facebook.com':
        return fetchFacebookContacts();
      default:
        return [];
    }
  }, [currentUser, fetchGoogleContacts, fetchFacebookContacts]);

  return { fetchContacts };
}

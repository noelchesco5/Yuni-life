import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRoleKind = 'student' | 'cr' | 'minister' | 'executive' | 'admin';

export interface UserRoleProfile {
  id: string;
  name: string;
  kind: UserRoleKind;
  title: string;
  ministry?: string;
  scope: string; // e.g. 'MD Year 2', 'ministry:welfare', 'global'
  isLeader: boolean;
  avatar: string;
}

const DEFAULT_STUDENT: UserRoleProfile = {
  id: 'usr-1',
  name: 'Amina Mwangi',
  kind: 'student',
  title: 'Student',
  scope: 'MD Year 2 · MUHAS',
  isLeader: false,
  avatar: 'AM',
};

const SAMPLE_LEADER_MINISTER: UserRoleProfile = {
  id: 'usr-2',
  name: 'Noel Chesco',
  kind: 'minister',
  title: 'Minister, Welfare, Ceremonies and Disaster Management',
  ministry: 'Welfare, Ceremonies and Disaster Management',
  scope: 'ministry:welfare',
  isLeader: true,
  avatar: 'NC',
};

const SAMPLE_LEADER_CR: UserRoleProfile = {
  id: 'usr-3',
  name: 'David Kweka',
  kind: 'cr',
  title: 'Class Representative (CR)',
  scope: 'cohort:md-year-2',
  isLeader: true,
  avatar: 'DK',
};

interface RoleContextType {
  currentProfile: UserRoleProfile;
  setRoleKind: (kind: UserRoleKind) => void;
  actingTitle: string;
  setActingTitle: (title: string) => void;
}

const RoleContext = createContext<RoleContextType>({
  currentProfile: DEFAULT_STUDENT,
  setRoleKind: () => {},
  actingTitle: 'Student',
  setActingTitle: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<UserRoleProfile>(() => {
    const saved = localStorage.getItem('yuni_active_role');
    if (saved === 'minister') return SAMPLE_LEADER_MINISTER;
    if (saved === 'cr') return SAMPLE_LEADER_CR;
    return DEFAULT_STUDENT;
  });

  const [actingTitle, setActingTitle] = useState<string>(currentProfile.title);

  useEffect(() => {
    setActingTitle(currentProfile.title);
  }, [currentProfile]);

  const setRoleKind = (kind: UserRoleKind) => {
    let newProfile: UserRoleProfile;
    if (kind === 'minister') {
      newProfile = SAMPLE_LEADER_MINISTER;
    } else if (kind === 'cr') {
      newProfile = SAMPLE_LEADER_CR;
    } else {
      newProfile = DEFAULT_STUDENT;
    }
    setCurrentProfile(newProfile);
    localStorage.setItem('yuni_active_role', kind);
  };

  return (
    <RoleContext.Provider value={{ currentProfile, setRoleKind, actingTitle, setActingTitle }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(RoleContext);
}

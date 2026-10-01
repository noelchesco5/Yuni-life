import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRoleKind = 'student' | 'cr' | 'minister' | 'executive' | 'sports' | 'health' | 'election' | 'admin';

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

const SAMPLE_LEADER_PRESIDENT: UserRoleProfile = {
  id: 'usr-exec',
  name: 'Hon. Josephat Mrope',
  kind: 'executive',
  title: 'MUHASSO President',
  ministry: 'Executive Government',
  scope: 'global',
  isLeader: true,
  avatar: 'JM',
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

const SAMPLE_LEADER_HEALTH: UserRoleProfile = {
  id: 'usr-hlth',
  name: 'Grace Mallya',
  kind: 'health',
  title: 'Minister for Health and Environment',
  ministry: 'Health and Environment',
  scope: 'ministry:health',
  isLeader: true,
  avatar: 'GM',
};

const SAMPLE_LEADER_SPORTS: UserRoleProfile = {
  id: 'usr-sprt',
  name: 'Kelvin Shayo',
  kind: 'sports',
  title: 'Minister for Sports and Entertainment',
  ministry: 'Sports and Entertainment',
  scope: 'ministry:sports',
  isLeader: true,
  avatar: 'KS',
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

const SAMPLE_LEADER_ELECTION: UserRoleProfile = {
  id: 'usr-elec',
  name: 'Returning Officer Baraka',
  kind: 'election',
  title: 'Chief Election Officer',
  ministry: 'Constitution, Laws and Good Governance',
  scope: 'elections:global',
  isLeader: true,
  avatar: 'RO',
};

interface RoleContextType {
  currentProfile: UserRoleProfile;
  setRoleKind: (kind: UserRoleKind) => void;
  actingTitle: string;
  setActingTitle: (title: string) => void;
  allRolePresets: { kind: UserRoleKind; label: string; profile: UserRoleProfile }[];
}

const ALL_PRESETS: { kind: UserRoleKind; label: string; profile: UserRoleProfile }[] = [
  { kind: 'minister', label: 'Minister (Welfare)', profile: SAMPLE_LEADER_MINISTER },
  { kind: 'executive', label: 'President (Executive)', profile: SAMPLE_LEADER_PRESIDENT },
  { kind: 'health', label: 'Minister (Health)', profile: SAMPLE_LEADER_HEALTH },
  { kind: 'sports', label: 'Minister (Sports)', profile: SAMPLE_LEADER_SPORTS },
  { kind: 'cr', label: 'Class Rep (MD Year 2)', profile: SAMPLE_LEADER_CR },
  { kind: 'election', label: 'Election Officer', profile: SAMPLE_LEADER_ELECTION },
  { kind: 'student', label: 'Regular Student', profile: DEFAULT_STUDENT },
];

const RoleContext = createContext<RoleContextType>({
  currentProfile: SAMPLE_LEADER_MINISTER,
  setRoleKind: () => {},
  actingTitle: 'Minister, Welfare, Ceremonies and Disaster Management',
  setActingTitle: () => {},
  allRolePresets: ALL_PRESETS,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<UserRoleProfile>(() => {
    const saved = localStorage.getItem('yuni_active_role');
    const matched = ALL_PRESETS.find((p) => p.kind === saved);
    if (matched) return matched.profile;
    return SAMPLE_LEADER_MINISTER;
  });

  const [actingTitle, setActingTitle] = useState<string>(currentProfile.title);

  useEffect(() => {
    setActingTitle(currentProfile.title);
  }, [currentProfile]);

  const setRoleKind = (kind: UserRoleKind) => {
    const preset = ALL_PRESETS.find((p) => p.kind === kind);
    const newProfile = preset ? preset.profile : DEFAULT_STUDENT;
    setCurrentProfile(newProfile);
    localStorage.setItem('yuni_active_role', kind);
  };

  return (
    <RoleContext.Provider value={{ currentProfile, setRoleKind, actingTitle, setActingTitle, allRolePresets: ALL_PRESETS }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(RoleContext);
}

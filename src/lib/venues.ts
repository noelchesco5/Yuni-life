export interface Venue {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: 'lecture_hall' | 'lab' | 'library' | 'sports' | 'cafeteria' | 'hostel';
  lat: number;
  lng: number;
  description: string;
  availableSlots?: string[];
}

export const MUHAS_CAMPUS_CENTER = {
  lat: -6.8045,
  lng: 39.2748,
  zoom: 17,
};

export const MUHAS_VENUES: Venue[] = [
  {
    id: 'lt-1',
    name: 'Lecture Theatre 1 (LT 1)',
    building: 'Main Academic Block',
    capacity: 250,
    type: 'lecture_hall',
    lat: -6.8042,
    lng: 39.2745,
    description: 'Main lecture theatre for Year 1 & 2 Medicine lectures. Equipped with dual projectors.',
    availableSlots: ['08:00 - 10:00', '14:00 - 16:00'],
  },
  {
    id: 'lt-2',
    name: 'Lecture Theatre 2 (LT 2)',
    building: 'Main Academic Block',
    capacity: 200,
    type: 'lecture_hall',
    lat: -6.8044,
    lng: 39.2747,
    description: 'Pharmacy and Nursing large lectures.',
    availableSlots: ['10:00 - 12:00', '16:00 - 18:00'],
  },
  {
    id: 'lt-3',
    name: 'Lecture Theatre 3 (LT 3)',
    building: 'Clinical Sciences Wing',
    capacity: 180,
    type: 'lecture_hall',
    lat: -6.8048,
    lng: 39.2751,
    description: 'Anatomy, Physiology and Pathology sessions.',
    availableSlots: ['12:00 - 14:00', '16:00 - 17:30'],
  },
  {
    id: 'mph',
    name: 'Multipurpose Hall (MPH)',
    building: 'Student Centre',
    capacity: 600,
    type: 'lecture_hall',
    lat: -6.8052,
    lng: 39.2742,
    description: 'General assemblies, exams, cultural ceremonies, and ministerial conferences.',
    availableSlots: ['Evening windows only'],
  },
  {
    id: 'path-lab',
    name: 'Pathology & Histology Lab',
    building: 'Laboratory Complex',
    capacity: 80,
    type: 'lab',
    lat: -6.8038,
    lng: 39.2754,
    description: 'Equipped with digital microscopes and tissue staining stations.',
    availableSlots: ['09:00 - 11:00'],
  },
  {
    id: 'library',
    name: 'MUHAS Main Library',
    building: 'Library Complex',
    capacity: 400,
    type: 'library',
    lat: -6.8041,
    lng: 39.2738,
    description: 'Quiet study zones, computer labs, reference section. Wi-Fi hub.',
    availableSlots: ['Open 07:00 - 23:00'],
  },
  {
    id: 'cafeteria',
    name: 'Main Student Cafeteria',
    building: 'Dining Hall',
    capacity: 350,
    type: 'cafeteria',
    lat: -6.8055,
    lng: 39.2746,
    description: 'Food and cafeteria services. Lunch rush 12:30 - 14:30.',
    availableSlots: ['Meals available'],
  },
];

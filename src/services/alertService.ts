import { AlertItem } from '../types';

let systemAlerts: AlertItem[] = [
  {
    id: 'alt-01',
    type: 'vehicle',
    severity: 'red',
    title: 'Vehicle stopped unexpectedly',
    description: 'Vehicle TN-38-CD-2401 has been stationary for 22 minutes on the Oddanchatram bypass corridor with engine idling.',
    location: 'Oddanchatram Bypass, NH 83',
    timestamp: '4 mins ago',
    impactMinutes: 22,
    isRead: false,
    vehicleRegistration: 'TN-38-CD-2401',
    actionLabel: 'Contact Driver Praveen'
  },
  {
    id: 'alt-02',
    type: 'traffic',
    severity: 'orange',
    title: 'Heavy traffic detected',
    description: 'Traffic speed dropped to 18 km/h along Dindigul 4-lane bypass due to freight bottleneck and ongoing lane inspection.',
    location: 'Dindigul 4-Lane Bypass (NH 83)',
    timestamp: '9 mins ago',
    impactMinutes: 18,
    isRead: false,
    actionLabel: 'Recommend Alternate Bypass'
  },
  {
    id: 'alt-03',
    type: 'traffic',
    severity: 'orange',
    title: 'ETA delayed by 24 min',
    description: 'Vehicle TN-38-CD-2401 projected arrival in Chennai pushed by +24 min due to severe stop-and-go congestion.',
    location: 'Palladam Arterial Corridor',
    timestamp: '15 mins ago',
    impactMinutes: 24,
    isRead: false,
    vehicleRegistration: 'TN-38-CD-2401',
    actionLabel: 'Recalculate Arrival Schedule'
  },
  {
    id: 'alt-04',
    type: 'weather',
    severity: 'orange',
    title: 'Heavy rainfall ahead',
    description: 'Intense precipitation and reduced surface visibility detected 14 km ahead on NH 83 near Vedasandur stretch.',
    location: 'Vedasandur Stretch, NH 83',
    timestamp: '22 mins ago',
    impactMinutes: 12,
    isRead: false,
    actionLabel: 'Transmit Wet Pavement Warning'
  },
  {
    id: 'alt-05',
    type: 'vehicle',
    severity: 'red',
    title: 'Vehicle deviated from planned route',
    description: 'Vehicle TN-45-GH-4207 has strayed 2.4 km away from its scheduled primary corridor onto an unverified village link road.',
    location: 'Oddanchatram Rural Perimeter',
    timestamp: '31 mins ago',
    impactMinutes: 16,
    isRead: false,
    vehicleRegistration: 'TN-45-GH-4207',
    actionLabel: 'Send Route Re-alignment'
  }
];

export const alertService = {
  getAlerts(): AlertItem[] {
    return systemAlerts;
  },

  getUnreadCount(): number {
    return systemAlerts.filter((a) => !a.isRead).length;
  },

  markAsRead(id: string) {
    systemAlerts = systemAlerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
    return [...systemAlerts];
  },

  markAllAsRead() {
    systemAlerts = systemAlerts.map((a) => ({ ...a, isRead: true }));
    return [...systemAlerts];
  },

  dismissAlert(id: string) {
    systemAlerts = systemAlerts.filter((a) => a.id !== id);
    return [...systemAlerts];
  }
};

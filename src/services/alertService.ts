import { AlertItem } from '../types';

let systemAlerts: AlertItem[] = [
  {
    id: 'alt-01',
    type: 'speed',
    severity: 'orange',
    title: 'Speed Governor Advisory',
    description: 'Vehicle TN-38-AB-1204 exceeded 80 km/h commercial limit on NH 83 corridor.',
    location: 'NH 83 — Dindigul Corridor',
    timestamp: '2 mins ago',
    impactMinutes: 0,
    isRead: false,
    vehicleRegistration: 'TN-38-AB-1204',
    actionLabel: 'Notify Driver Subramanian'
  },
  {
    id: 'alt-02',
    type: 'traffic',
    severity: 'red',
    title: 'Severe Arterial Congestion',
    description: 'Bypass slowdown near Dindigul Junction due to road resurfacing. Transit delay +11 mins.',
    location: 'Dindigul 4-Lane Bypass',
    timestamp: '8 mins ago',
    impactMinutes: 11,
    isRead: false,
    actionLabel: 'Inspect Alternate Corridor'
  },
  {
    id: 'alt-03',
    type: 'weather',
    severity: 'yellow',
    title: 'Precipitation Warning',
    description: 'Light rain reported along Madurai Ring Road. Surface traction alert issued to fleet.',
    location: 'Madurai Ring Road',
    timestamp: '18 mins ago',
    impactMinutes: 6,
    isRead: false,
    actionLabel: 'View Weather Overlay'
  },
  {
    id: 'alt-04',
    type: 'vehicle',
    severity: 'orange',
    title: 'Telemetry Heartbeat Standby',
    description: 'Vehicle TN-45-BK-5520 engine idling at Salem Logistics Hub. Awaiting active dispatch route.',
    location: 'Salem Freight Hub',
    timestamp: '35 mins ago',
    impactMinutes: 0,
    isRead: true,
    vehicleRegistration: 'TN-45-BK-5520',
    actionLabel: 'Assign Driver Route'
  },
  {
    id: 'alt-05',
    type: 'accessibility',
    severity: 'yellow',
    title: 'Pedestrian Ramp Maintenance',
    description: 'Temporary utility cabling along sidewalk near Avinashi service lane. Step-free detour marked.',
    location: 'Avinashi Road Corridor',
    timestamp: '1 hour ago',
    impactMinutes: 4,
    isRead: true,
    actionLabel: 'Inspect Accessible Path'
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

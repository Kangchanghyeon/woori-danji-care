export type ActivityType = "memo" | "call";

export type CustomerActivity = {
  id: string;
  customerId: string;
  type: ActivityType;
  content: string;
  date: string; // ISO string
};

const STORAGE_KEY = "woori-customer-activities";

function load(): CustomerActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerActivity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(activities: CustomerActivity[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // ignore
  }
}

export function getActivities(customerId: string): CustomerActivity[] {
  return load()
    .filter((a) => a.customerId === customerId)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function addActivity(
  customerId: string,
  data: { type: ActivityType; content: string }
): CustomerActivity {
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const activity: CustomerActivity = {
    id,
    customerId,
    type: data.type,
    content: data.content.trim(),
    date: new Date().toISOString(),
  };
  const list = load();
  list.unshift(activity);
  save(list);
  return activity;
}

export function deleteActivity(activityId: string): void {
  const list = load().filter((a) => a.id !== activityId);
  save(list);
}

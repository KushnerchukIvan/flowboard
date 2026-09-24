export type TaskStatus = "todo" | "progress" | "done";
export interface Task {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  priority: "high" | "medium" | "low";
  assignee: string;
  due: string;
  dueDate?: string;
  description?: string;
  tag: string;
}
export interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
  progress: number;
  due: string;
  members: string[];
  tasks: number;
}

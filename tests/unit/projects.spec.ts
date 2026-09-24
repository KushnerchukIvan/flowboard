import { describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useProjectsStore } from "../../stores/projects";
describe("projects store", () => {
  it("filters projects by name and client", () => {
    setActivePinia(createPinia());
    const store = useProjectsStore();
    store.projects = [
      {
        id: "p1",
        name: "Банкінг",
        client: "Northstar",
        color: "violet",
        progress: 72,
        due: "18 жов",
        members: [],
        tasks: 3,
      },
    ];
    store.search = "north";
    expect(store.filteredProjects).toHaveLength(1);
    store.search = "missing";
    expect(store.filteredProjects).toHaveLength(0);
  });
  it("moves tasks across workflow statuses", () => {
    setActivePinia(createPinia());
    const store = useProjectsStore();
    store.moveTask("t1", "progress");
    expect(store.tasks.find((task) => task.id === "t1")?.status).toBe(
      "progress",
    );
  });
});

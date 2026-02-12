import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectFile {
    name: string;
    content: string;
    language: string;
    path: string;
}

export interface Project {
    id: string;
    name: string;
    created_at: number;
    files: ProjectFile[];
}

interface ProjectState {
    projects: Project[];
    activeProject: Project | null;
    activeFile: ProjectFile | null;
    activeCodeFile: string | null;

    addProject: (name: string) => void;
    deleteProject: (id: string) => void;
    setActiveProject: (project: Project | null) => void;
    setActiveFile: (file: ProjectFile | null) => void;
    updateProjectFile: (path: string, content: string) => void;
    addProjectFile: (file: ProjectFile) => void;
    setActiveCodeFile: (name: string) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            projects: [],
            activeProject: null,
            activeFile: null,
            activeCodeFile: null,

            addProject: (name) => {
                const newProject: Project = {
                    id: uuidv4(),
                    name,
                    created_at: Date.now(),
                    files: []
                };
                set((state) => ({
                    projects: [...state.projects, newProject]
                }));
            },

            deleteProject: (id) => set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                activeProject: state.activeProject?.id === id ? null : state.activeProject
            })),

            setActiveProject: (project) => set({ activeProject: project }),

            setActiveFile: (file) => set({ activeFile: file }),

            setActiveCodeFile: (name) => set({ activeCodeFile: name }),

            updateProjectFile: (path, content) => set((state) => {
                if (!state.activeProject) return state;
                const updatedFiles = state.activeProject.files.map(f =>
                    f.path === path ? { ...f, content } : f
                );
                const updatedProject = { ...state.activeProject, files: updatedFiles };
                return {
                    activeProject: updatedProject,
                    projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
                };
            }),

            addProjectFile: (file) => set((state) => {
                if (!state.activeProject) return state;
                const updatedProject = {
                    ...state.activeProject,
                    files: [...state.activeProject.files, file]
                };
                return {
                    activeProject: updatedProject,
                    projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
                };
            }),
        }),
        {
            name: 'nexa-project-storage',
        }
    )
);

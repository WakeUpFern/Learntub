/**
 * Store — Data layer con Supabase y fallback a localStorage
 *
 * Todas las funciones son async. Si Supabase no está disponible o el usuario
 * no está autenticado, usan localStorage como fallback.
 */

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'learntube_data';

// ─── LocalStorage helpers (fallback) ───────────────────────
function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

function getLocalData() {
    if (typeof window === 'undefined') return { courses: [], modules: [] };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { courses: [], modules: [] };
        return JSON.parse(raw);
    } catch {
        return { courses: [], modules: [] };
    }
}

function saveLocalData(data) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Determina si debemos usar Supabase o localStorage.
 */
function useSupabase(userId) {
    return isSupabaseConfigured() && !!userId;
}

// ─── Courses ───────────────────────────────────────────────

export async function getCourses(userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Store] Error fetching courses:', error);
            return [];
        }

        // Obtener módulos para calcular progreso
        const courseIds = courses.map(c => c.id);
        let modules = [];
        if (courseIds.length > 0) {
            const { data: mods } = await supabase
                .from('modules')
                .select('*')
                .in('course_id', courseIds);
            modules = mods || [];
        }

        return courses.map(course => {
            const courseModules = modules.filter(m => m.course_id === course.id);
            const completed = courseModules.filter(m => m.is_completed).length;
            return {
                id: course.id,
                youtubeId: course.youtube_id,
                title: course.title,
                thumbnailUrl: course.thumbnail_url,
                channelName: course.channel_name,
                createdAt: course.created_at,
                totalModules: courseModules.length,
                completedModules: completed,
            };
        });
    }

    // Fallback: localStorage
    const data = getLocalData();
    return data.courses.map(course => {
        const courseModules = data.modules.filter(m => m.courseId === course.id);
        const completed = courseModules.filter(m => m.isCompleted).length;
        return {
            ...course,
            totalModules: courseModules.length,
            completedModules: completed,
        };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getCourse(id, userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();
        const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !course) {
            console.error('[Store] Error fetching course:', error);
            return null;
        }

        const { data: mods } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', id)
            .order('position', { ascending: true });

        const modules = (mods || []).map(m => ({
            id: m.id,
            courseId: m.course_id,
            title: m.title,
            startTime: m.start_time,
            endTime: m.end_time,
            position: m.position,
            isCompleted: m.is_completed,
            completedAt: m.completed_at,
            youtubeId: m.youtube_id,
        }));

        const completed = modules.filter(m => m.isCompleted).length;

        return {
            id: course.id,
            youtubeId: course.youtube_id,
            title: course.title,
            thumbnailUrl: course.thumbnail_url,
            channelName: course.channel_name,
            createdAt: course.created_at,
            modules,
            totalModules: modules.length,
            completedModules: completed,
        };
    }

    // Fallback: localStorage
    const data = getLocalData();
    const course = data.courses.find(c => c.id === id);
    if (!course) return null;

    const courseModules = data.modules
        .filter(m => m.courseId === id)
        .sort((a, b) => a.position - b.position);

    const completed = courseModules.filter(m => m.isCompleted).length;
    return {
        ...course,
        modules: courseModules,
        totalModules: courseModules.length,
        completedModules: completed,
    };
}

export async function addCourse({ youtubeId, title, thumbnailUrl, channelName, modules: chaptersData }, userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();

        // Insertar curso
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert({
                user_id: userId,
                youtube_id: youtubeId,
                title,
                thumbnail_url: thumbnailUrl,
                channel_name: channelName || 'Unknown Channel',
            })
            .select()
            .single();

        if (courseError) {
            console.error('[Store] Error inserting course:', {
                message: courseError.message,
                code: courseError.code,
                details: courseError.details,
                hint: courseError.hint,
            });
            return { error: courseError.message || 'Error al guardar el curso en Supabase' };
        }

        const modulesToInsert = chaptersData.map((ch, i) => ({
            course_id: course.id,
            title: ch.title,
            start_time: ch.startTime,
            end_time: ch.endTime,
            position: ch.position || i + 1,
            is_completed: false,
            youtube_id: ch.youtubeId,
        }));

        const { data: modules, error: modulesError } = await supabase
            .from('modules')
            .insert(modulesToInsert)
            .select();

        if (modulesError) {
            console.error('[Store] Error inserting modules:', modulesError);
        }

        return {
            id: course.id,
            youtubeId: course.youtube_id,
            title: course.title,
            thumbnailUrl: course.thumbnail_url,
            channelName: course.channel_name,
            modules: (modules || []).map(m => ({
                id: m.id,
                courseId: m.course_id,
                title: m.title,
                startTime: m.start_time,
                endTime: m.end_time,
                position: m.position,
                isCompleted: m.is_completed,
                completedAt: m.completed_at,
                youtubeId: m.youtube_id,
            })),
            totalModules: modules?.length || 0,
            completedModules: 0,
        };
    }

    // Fallback: localStorage
    const data = getLocalData();
    const courseId = generateId();
    const course = {
        id: courseId,
        youtubeId,
        title,
        thumbnailUrl,
        channelName: channelName || 'Unknown Channel',
        createdAt: new Date().toISOString(),
    };

    const modules = chaptersData.map((ch, i) => ({
        id: generateId(),
        courseId,
        title: ch.title,
        startTime: ch.startTime,
        endTime: ch.endTime,
        position: ch.position || i + 1,
        isCompleted: false,
        completedAt: null,
        youtubeId: ch.youtubeId,
    }));

    data.courses.push(course);
    data.modules.push(...modules);
    saveLocalData(data);

    return { ...course, modules, totalModules: modules.length, completedModules: 0 };
}

export async function deleteCourse(id, userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();
        // Modules are deleted by CASCADE
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('[Store] Error deleting course:', error);
        }
        return;
    }

    // Fallback: localStorage
    const data = getLocalData();
    data.courses = data.courses.filter(c => c.id !== id);
    data.modules = data.modules.filter(m => m.courseId !== id);
    saveLocalData(data);
}

// ─── Modules ───────────────────────────────────────────────

export async function toggleModuleComplete(moduleId, userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();

        // Obtener estado actual
        const { data: mod, error: fetchError } = await supabase
            .from('modules')
            .select('is_completed')
            .eq('id', moduleId)
            .single();

        if (fetchError || !mod) {
            console.error('[Store] Error fetching module:', fetchError);
            return null;
        }

        const newCompleted = !mod.is_completed;
        const { data: updated, error: updateError } = await supabase
            .from('modules')
            .update({
                is_completed: newCompleted,
                completed_at: newCompleted ? new Date().toISOString() : null,
            })
            .eq('id', moduleId)
            .select()
            .single();

        if (updateError) {
            console.error('[Store] Error updating module:', updateError);
            return null;
        }

        return {
            id: updated.id,
            courseId: updated.course_id,
            title: updated.title,
            startTime: updated.start_time,
            endTime: updated.end_time,
            position: updated.position,
            isCompleted: updated.is_completed,
            completedAt: updated.completed_at,
            youtubeId: updated.youtube_id,
        };
    }

    // Fallback: localStorage
    const data = getLocalData();
    const mod = data.modules.find(m => m.id === moduleId);
    if (!mod) return null;

    mod.isCompleted = !mod.isCompleted;
    mod.completedAt = mod.isCompleted ? new Date().toISOString() : null;
    saveLocalData(data);
    return mod;
}

export async function getProgress(userId) {
    if (useSupabase(userId)) {
        const supabase = getSupabaseClient();

        const { data: courses } = await supabase
            .from('courses')
            .select('id')
            .eq('user_id', userId);

        if (!courses || courses.length === 0) {
            return { totalCourses: 0, completedCourses: 0, totalModules: 0, completedModules: 0 };
        }

        const courseIds = courses.map(c => c.id);
        const { data: modules } = await supabase
            .from('modules')
            .select('course_id, is_completed')
            .in('course_id', courseIds);

        const totalModules = modules?.length || 0;
        const completedModules = modules?.filter(m => m.is_completed).length || 0;

        const completedCourses = courses.filter(course => {
            const mods = modules?.filter(m => m.course_id === course.id) || [];
            return mods.length > 0 && mods.every(m => m.is_completed);
        }).length;

        return {
            totalCourses: courses.length,
            completedCourses,
            totalModules,
            completedModules,
        };
    }

    // Fallback: localStorage
    const data = getLocalData();
    const totalCourses = data.courses.length;
    const totalModules = data.modules.length;
    const completedModules = data.modules.filter(m => m.isCompleted).length;
    const completedCourses = data.courses.filter(course => {
        const mods = data.modules.filter(m => m.courseId === course.id);
        return mods.length > 0 && mods.every(m => m.isCompleted);
    }).length;

    return { totalCourses, completedCourses, totalModules, completedModules };
}

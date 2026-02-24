-- Tablas y Esquema para Kanban App con Supabase (Versión Simplificada: Sin Miembros)

-- 1. Tablas Principales

-- Boards
CREATE TABLE IF NOT EXISTS public.boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid()
);

-- Columnas
CREATE TABLE IF NOT EXISTS public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
);

-- Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentarios
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Etiquetas
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6'
);

-- Tabla Pivote Task-Tags
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (task_id, tag_id)
);

-- 2. Automatización (Trigger para columnas por defecto)

CREATE OR REPLACE FUNCTION public.handle_new_board()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.columns (board_id, name, position)
    VALUES 
        (NEW.id, 'Por hacer', 1),
        (NEW.id, 'En progreso', 2),
        (NEW.id, 'Terminado', 3);
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_board_created
    AFTER INSERT ON public.boards
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_board();

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON public.columns(board_id);

-- 4. Row Level Security (RLS) y Funciones de Acceso

-- Función auxiliar para acceso (Solo el dueño tiene acceso)
CREATE OR REPLACE FUNCTION public.check_board_owner(board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.boards 
        WHERE id = board_uuid AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Habilitar RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Políticas para BOARDS
CREATE POLICY "Boards access" ON public.boards
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can create boards" ON public.boards
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para COLUMNS
CREATE POLICY "Columns access" ON public.columns
    FOR ALL USING (check_board_owner(board_id));

-- Políticas para TASKS
CREATE POLICY "Tasks access" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.columns
            WHERE columns.id = tasks.column_id
            AND check_board_owner(columns.board_id)
        )
    );

-- Políticas para COMMENTS
CREATE POLICY "Comments access" ON public.comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            JOIN public.columns ON columns.id = tasks.column_id
            WHERE tasks.id = comments.task_id
            AND check_board_owner(columns.board_id)
        )
    );

-- Políticas para TAGS
CREATE POLICY "Tags access" ON public.tags
    FOR ALL USING (check_board_owner(board_id));

-- Políticas para TASK_TAGS
CREATE POLICY "Task-Tags access" ON public.task_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            JOIN public.columns ON columns.id = tasks.column_id
            WHERE tasks.id = task_tags.task_id
            AND check_board_owner(columns.board_id)
        )
    );

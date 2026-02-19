-- backend/models/verified_schema.sql
-- This file contains the verified schema currently running in the Supabase environment.
-- Use this as the definitive reference for table structures and constraints.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attendance (
id integer NOT NULL DEFAULT nextval('attendance_id_seq'::regclass),
student_id integer,
attendance_date date NOT NULL,
session character varying NOT NULL CHECK (session::text = ANY (ARRAY['morning'::character varying, 'afternoon'::character varying]::text[])),
status character varying NOT NULL CHECK (status::text = ANY (ARRAY['present'::character varying, 'absent'::character varying]::text[])),
marked_by integer,
created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT attendance_pkey PRIMARY KEY (id),
CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id)
);

CREATE TABLE public.branches (
id integer NOT NULL DEFAULT nextval('branches_id_seq'::regclass),
branch_name character varying NOT NULL,
course_id integer,
CONSTRAINT branches_pkey PRIMARY KEY (id),
CONSTRAINT branches_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.courses (
id integer NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
course_name character varying NOT NULL UNIQUE,
CONSTRAINT courses_pkey PRIMARY KEY (id)
);

CREATE TABLE public.faculty_sections (
id integer NOT NULL DEFAULT nextval('faculty_sections_id_seq'::regclass),
faculty_id integer NOT NULL,
section_id integer NOT NULL,
CONSTRAINT faculty_sections_pkey PRIMARY KEY (id),
CONSTRAINT faculty_sections_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id),
CONSTRAINT faculty_sections_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);

CREATE TABLE public.sections (
id integer NOT NULL DEFAULT nextval('sections_id_seq'::regclass),
section_name character varying NOT NULL,
year_id integer,
branch_id integer,
CONSTRAINT sections_pkey PRIMARY KEY (id),
CONSTRAINT sections_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(id),
CONSTRAINT sections_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);

CREATE TABLE public.sms_logs (
id integer NOT NULL DEFAULT nextval('sms_logs_id_seq'::regclass),
student_id integer,
parent_phone character varying NOT NULL,
message text NOT NULL,
status character varying DEFAULT 'sent'::character varying,
request_id character varying,
sent_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT sms_logs_pkey PRIMARY KEY (id),
CONSTRAINT sms_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE TABLE public.students (
id integer NOT NULL DEFAULT nextval('students_id_seq'::regclass),
roll_number character varying NOT NULL UNIQUE,
full_name character varying NOT NULL,
parent_phone character varying NOT NULL CHECK (parent_phone::text ~ '^[0-9]{10}$'::text),
course_id integer NOT NULL,
section_id integer NOT NULL,
is_deleted boolean DEFAULT false,
created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
year_id integer,
branch_id integer,
CONSTRAINT students_pkey PRIMARY KEY (id),
CONSTRAINT students_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
CONSTRAINT students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id),
CONSTRAINT students_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(id),
CONSTRAINT students_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);

CREATE TABLE public.users (
id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
full_name character varying NOT NULL,
email character varying NOT NULL UNIQUE,
password_hash character varying NOT NULL,
role character varying DEFAULT 'faculty'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'faculty'::character varying]::text[])),
created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.years (
id integer NOT NULL DEFAULT nextval('years_id_seq'::regclass),
year_name character varying NOT NULL UNIQUE,
CONSTRAINT years_pkey PRIMARY KEY (id)
);
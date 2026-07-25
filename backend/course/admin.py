from django.contrib import admin
from .models import Category, Course, Module, Lesson, Enrollment, LearningActivity


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1


class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'mentor', 'category', 'price', 'level', 'is_published', 'created_at')
    list_filter = ('level', 'is_published', 'category')
    search_fields = ('title', 'description', 'mentor__email')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'created_at')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'duration', 'order', 'is_preview', 'created_at')
    list_filter = ('is_preview', 'module__course')
    search_fields = ('title', 'module__title')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at', 'is_completed')
    list_filter = ('is_completed', 'enrolled_at')
    search_fields = ('student__email', 'course__title')


@admin.register(LearningActivity)
class LearningActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'date', 'hours_spent', 'lessons_completed_count', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('user__email', 'course__title')





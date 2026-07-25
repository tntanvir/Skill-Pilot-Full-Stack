from rest_framework import permissions


class IsMentorOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow mentors and admins to create/edit courses,
    while allowing read-only access to everyone else.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['mentor', 'admin'] or request.user.is_staff or request.user.is_superuser)
        )


class IsCourseOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow creator mentor or admin to edit or delete a course.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'admin':
            return True
        # Check course ownership
        if hasattr(obj, 'mentor'):
            return obj.mentor == request.user
        elif hasattr(obj, 'course'):
            return obj.course.mentor == request.user
        elif hasattr(obj, 'module'):
            return obj.module.course.mentor == request.user
        return False

from rest_framework.permissions import BasePermission 


class IsTeacherOrHead(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['TEACHER', 'HEAD']
from rest_framework.permissions import BasePermission 

class IsHeadOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        roles = user.roles.values_list('role', flat=True)
        if request.method in ['POST', 'PUT', 'PATCH']:
            return 'HEAD' in roles 
        return True
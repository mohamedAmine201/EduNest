from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, LoginSerializer
from .models import User
from courses.models import Course
from profiles.models import StudentProfile, TeacherProfile
from profiles.serializers import StudentSerializer, TeacherSerializer
from datetime import datetime

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        nom    = request.data.get('nom')
        prenom = request.data.get('prenom')
        prenom_clean = prenom.lower().strip().replace(" ", "_")
        nom_clean    = nom.lower().strip().replace(" ", "_")
        username     = f"{prenom_clean}.{nom_clean}"
        email        = request.data.get('email')
        role         = request.data.get('role', 'student')
        current_year = datetime.now().year

        if role == 'student':
            from specialities.models import SpecialityYear
            matricule  = request.data.get('matricule')
            year       = request.data.get('year')
            speciality = request.data.get('speciality')
            password   = f"{speciality}{current_year}"

            try:
                speciality_year_obj = SpecialityYear.objects.get(year=year, speciality=speciality)
            except SpecialityYear.DoesNotExist:
                return Response({"detail": "Speciality/year not found"}, status=404)

            user = User.objects.create_user(
                username=username, password=password, email=email,
                first_name=prenom, last_name=nom,
                role=role.upper(), bio=f"{speciality} {role.capitalize()}"
            )
            StudentProfile.objects.create(user=user, matricule=matricule, speciality_year=speciality_year_obj)

        else:
            from courses.models import Course
            course   = request.data.get('course')
            password = str(current_year)

            try:
                course_obj = Course.objects.get(name=course)
            except Course.DoesNotExist:
                return Response({"detail": "Course not found"}, status=404)

            user = User.objects.create_user(
                username=username, password=password, email=email,
                first_name=prenom, last_name=nom,
                role=role, bio=role.capitalize()
            )
            teacher = TeacherProfile.objects.create(user=user)
            course_obj.teacher = teacher
            course_obj.save()

        return Response({"detail": "User created successfully"}, status=201)




class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    "token": token.key,
                    "user": {
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'role': user.role,
                        'bio': user.bio,
                        'profile_pic': request.build_absolute_uri(user.profile_pic.url) if user.profile_pic  else None,
                    }
                }, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UpdateUserView(APIView):
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)
        # Update user fields
        user.first_name = request.data.get('prenom', user.first_name)
        user.last_name = request.data.get('nom', user.last_name)
        new_email = request.data.get('email', user.email)
        if new_email != user.email:
            if User.objects.filter(email=new_email).exclude(pk=user.id).exists():
                return Response({"detail": "Email already in use"}, status=400)
            user.email = new_email
        user.save()

        # Update profile fields 
        role = user.role 
        if role == 'STUDENT':
            profile = user.student_profile
            profile.matricule = request.data.get('matricule', profile.matricule)
            year       = request.data.get('year', None)
            speciality = request.data.get('speciality', None)
            if year or speciality:
                from specialities.models import SpecialityYear
                try:
                    profile.speciality_year = SpecialityYear.objects.get(
                        year=year or profile.speciality_year.year,
                        speciality=speciality or profile.speciality_year.speciality
                    )
                except SpecialityYear.DoesNotExist:
                    return Response({"detail": "Speciality/year not found"}, status=404)
            profile.save()
        else:
            profile = user.teacher_profile
            course = request.data.get('course', None)
            if course:
                from courses.models import Course
                try:
                    course_obj = Course.objects.get(name=course)
                    course_obj.teacher = profile
                    course_obj.save()
                except Course.DoesNotExist:
                    return Response({"detail": "Course not found"}, status=404)

        return Response({"detail": "User updated successfully"}, status=200)


class DeleteUserView(APIView):
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        user.delete()
        return Response({"detail": "User deleted successfully"}, status=200)

import pandas as pd
from django.db import transaction
from .utils import smart_detect_columns
from specialities.models import SpecialityYear


class SpreadsheetUploadView(APIView):
    """Step 1 — Upload file, detect columns, return preview."""
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file.name.endswith(".xlsx") or file.name.endswith(".xls"):
                df = pd.read_excel(file)
            else:
                df = pd.read_csv(file)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        df.dropna(how="all", inplace=True)
        df = df.where(pd.notnull(df), None)

        headers = list(df.columns)
        detected = smart_detect_columns(headers)

        return Response({
            "detected_columns": detected,
            "headers": headers,
            "preview": df.head(5).to_dict(orient="records"),
            "total_rows": len(df),
            "rows": df.to_dict(orient="records"),
        })


class BulkImportView(APIView):
    """Step 2 — Confirm mapping, create Users + profiles."""
    def post(self, request):
        mapping      = request.data.get("mapping", {})
        rows         = request.data.get("rows", [])
        role         = request.data.get("role", "student")   # "student" | "teacher"
        speciality   = request.data.get("speciality", "DSIA")
        academic_year = request.data.get("academic_year") 
        current_year = request.data.get("current_year", "2026")

        # --- Validate required fields based on role ---
        if role == "student":
            required = ["matricule", "nom", "prenom", "email"]
        else:
            required = ["course", "nom", "prenom", "email"]

        missing = [f for f in required if f not in mapping]
        if missing:
            return Response(
                {"error": f"Missing column mappings: {missing}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # --- Fetch SpecialityYear once before the loop (for students) ---
        speciality_year_obj = None
        if role == "student":
            try:
                speciality_year_obj = SpecialityYear.objects.get(
                    year=academic_year,
                    speciality=speciality
                )
            except SpecialityYear.DoesNotExist:
                return Response(
                    {"error": f"No SpecialityYear found for year {academic_year} and speciality {speciality}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # --- Fetch valid courses from DB once (for teachers) ---
        valid_courses = {}
        if role == "teacher":
            valid_courses = {
                c.name.lower(): c for c in Course.objects.all()
            }  # { "math": <Course>, "physics": <Course>, ... }

        created, skipped, errors = [], [], []

        for row in rows:
            try:
                with transaction.atomic():
                    nom    = str(row[mapping["nom"]]).strip()
                    prenom = str(row[mapping["prenom"]]).strip()
                    prenom_clean = prenom.lower().strip().replace(" ", "_")
                    nom_clean    = nom.lower().strip().replace(" ", "_")
                    email  = str(row[mapping["email"]]).strip()

                    username     = f"{prenom_clean}.{nom_clean}"

                    if User.objects.filter(email=email).exists():
                        skipped.append({"email": email, "reason": "Email already exists"})
                        continue

                    if User.objects.filter(username=username).exists():
                        username = f"{username}.{nom.lower()}"

                    if role == "student":
                        matricule = str(row[mapping["matricule"]]).strip()
                        password = f"{speciality}{current_year}"

                        user = User.objects.create_user(
                            username=username,
                            email=email,
                            password=password,
                            first_name=prenom,
                            last_name=nom,
                            role=role.upper(),
                            bio=f"{speciality} {role.capitalize()}"
                        )
                        profile = StudentProfile.objects.create(user=user, matricule=matricule, speciality_year=speciality_year_obj)
                        created.append(StudentSerializer(profile).data)

                    else:  # teacher
                        course_name = str(row[mapping["course"]]).strip()
                        password = current_year

                        course_obj = valid_courses.get(course_name.lower())
                        if not course_obj:
                            skipped.append({
                                "email": email,
                                "reason": f"Course '{course_name}' not found in database"
                            })
                            continue

                        user = User.objects.create_user(
                            username=username,
                            email=email,
                            password=password,
                            first_name=prenom,
                            last_name=nom,
                            role=role.upper(),
                            bio=role.capitalize()
                        )
                        profile = TeacherProfile.objects.create(user=user)

                        course_obj.teacher = profile
                        course_obj.save()

                        created.append(TeacherSerializer(profile).data)

            except Exception as e:
                errors.append({"row": row, "error": str(e)})

        return Response({
            "created": len(created),
            "skipped": len(skipped),
            "errors": len(errors),
            "details": {"created": created, "skipped": skipped, "errors": errors},
        }, status=status.HTTP_201_CREATED)
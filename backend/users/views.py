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
        nom          = request.data.get('nom')
        prenom       = request.data.get('prenom')
        email        = request.data.get('email')
        identifier   = request.data.get('identifier')
        phone_number = request.data.get('phone_number') or None
        role         = request.data.get('role', 'STUDENT').upper()  # normalize
        current_year = datetime.now().year

        prenom_clean = prenom.lower().strip().replace(" ", "_")
        nom_clean    = nom.lower().strip().replace(" ", "_")
        username     = f"{prenom_clean}.{nom_clean}"

        if role == 'STUDENT':
            from specialities.models import SpecialityYear
            year       = request.data.get('year')
            speciality = request.data.get('speciality')
            password   = f"{speciality}{current_year}"

            try:
                speciality_year_obj = SpecialityYear.objects.get(
                    year=year, speciality=speciality
                )
            except SpecialityYear.DoesNotExist:
                return Response({"detail": "Speciality/year not found"}, status=404)

            user = User.objects.create_user(
                identifier=identifier, username=username, password=password,
                email=email, first_name=prenom, last_name=nom,
                phone_number=phone_number, role='STUDENT',
                bio=f"{speciality} Student",
            )
            StudentProfile.objects.create(user=user, speciality_year=speciality_year_obj)

        elif role == 'TEACHER':
            from courses.models import Course
            courses_raw = request.data.get('courses') or None
            password    = str(current_year)

            user = User.objects.create_user(
                identifier=identifier, username=username, password=password,
                email=email, first_name=prenom, last_name=nom,
                phone_number=phone_number, role='TEACHER',
                bio="Teacher",
            )
            teacher = TeacherProfile.objects.create(user=user)

            if courses_raw:
                names = [c.strip() for c in courses_raw.split(',') if c.strip()]

                found, missing = [], []
                for name in names:
                    try:
                        found.append(Course.objects.get(name=name))
                    except Course.DoesNotExist:
                        missing.append(name)

                if missing:
                    # Roll back the user we just created
                    user.delete()
                    return Response(
                        {"detail": f"Courses not found: {', '.join(missing)}"},
                        status=404,
                    )

                teacher.courses.set(found)

        else:
            return Response({"detail": f"Invalid role: {role}"}, status=400)

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
                        'phone_number': user.phone_number
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

        # ── User-level fields ──────────────────────────────────────────────
        user.first_name  = request.data.get('prenom', user.first_name)
        user.last_name   = request.data.get('nom', user.last_name)
        identifier = request.data.get('identifier')
        if User.objects.filter(identifier=identifier).exclude(pk=user.id).exists():
            return Response({"detail": "Identifier already in use"}, status=400)
        user.identifier  = request.data.get('identifier', user.identifier)
        user.phone_number = request.data.get('phone_number', user.phone_number) or None

        new_email = request.data.get('email', user.email)
        if new_email != user.email:
            if User.objects.filter(email=new_email).exclude(pk=user.id).exists():
                return Response({"detail": "Email already in use"}, status=400)
            user.email    = new_email
            user.username = new_email   # keep username in sync if you use email as username

        user.save()

        # ── Profile fields ─────────────────────────────────────────────────
        if user.role == 'STUDENT':
            profile = user.student_profile
            year       = request.data.get('year')       or None
            speciality = request.data.get('speciality') or None

            if year or speciality:
                from specialities.models import SpecialityYear
                try:
                    profile.speciality_year = SpecialityYear.objects.get(
                        year=year             or profile.speciality_year.year,
                        speciality=speciality or profile.speciality_year.speciality,
                    )
                except SpecialityYear.DoesNotExist:
                    return Response({"detail": "Speciality/year combination not found"}, status=404)

            profile.save()

        elif user.role == 'TEACHER':
            profile = user.teacher_profile

            # Use a sentinel to detect "field was not sent at all"
            MISSING = object()
            courses_raw = request.data.get('courses', MISSING)

            if courses_raw is not MISSING:
                # Field was explicitly sent (even if empty)
                if not courses_raw or not courses_raw.strip():
                    # Empty string → remove all courses
                    profile.courses.clear()
                else:
                    from courses.models import Course
                    names = [c.strip() for c in courses_raw.split(',') if c.strip()]

                    found, missing = [], []
                    for name in names:
                        try:
                            found.append(Course.objects.get(name=name))
                        except Course.DoesNotExist:
                            missing.append(name)

                    if missing:
                        return Response(
                            {"detail": f"Courses not found: {', '.join(missing)}"},
                            status=404,
                        )

                    # set() handles both additions and removals in one call
                    profile.courses.set(found)

            profile.save()
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

def find_header_row_generic(file, required_fields=None, max_scan=20):
    """
    Scan up to max_scan rows to find the one whose values best match
    required_fields (case-insensitive substring match).
    Returns the 0-based row index, or raises ValueError.
    """
    file.seek(0)
    name = file.name.lower()

    if name.endswith((".xlsx", ".xls")):
        raw = pd.read_excel(file, header=None, nrows=max_scan, dtype=str)
    else:
        raw = pd.read_csv(file, header=None, nrows=max_scan, dtype=str)

    required = [f.lower() for f in (required_fields or [])]

    for i, row in raw.iterrows():
        cells = [str(c).strip().lower() for c in row if pd.notna(c) and str(c).strip()]
        if not cells:
            continue
        # Accept the row if every required field fuzzy-matches at least one cell
        if all(any(req in cell or cell in req for cell in cells) for req in required):
            return i

    raise ValueError(
        f"Could not find a header row containing {required_fields} "
        f"in the first {max_scan} rows."
    )

REQUIRED_FIELDS = ["identifier", "nom", "prenom", "email"]

class SpreadsheetUploadView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided."}, status=400)

        try:
            header_row = find_header_row_generic(file, required_fields=REQUIRED_FIELDS)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        try:
            file.seek(0)
            if file.name.lower().endswith((".xlsx", ".xls")):
                df = pd.read_excel(file, header=header_row, dtype=str)
            else:
                df = pd.read_csv(file, header=header_row, dtype=str)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        df.dropna(how="all", inplace=True)
        df = df.where(pd.notnull(df), None)

        headers = list(df.columns)
        detected = smart_detect_columns(headers)

        return Response({
            "detected_columns": detected,
            "headers":          headers,
            "preview":          df.head(5).to_dict(orient="records"),
            "total_rows":       len(df),
            "rows":             df.to_dict(orient="records"),
        })


class BulkImportView(APIView):
    def post(self, request):
        mapping       = request.data.get("mapping", {})
        rows          = request.data.get("rows", [])
        role          = request.data.get("role", "").upper()
        speciality    = request.data.get("speciality") or None
        current_year  = request.data.get("current_year") or None
        year = request.data.get("year") or None

        created, skipped, errors = [], [], []

        for row in rows:
            try:
                identifier = row.get(mapping.get("identifier"))
                nom        = row.get(mapping.get("nom"))
                prenom     = row.get(mapping.get("prenom"))
                clean_first = prenom.strip().replace(" ", "_").lower()
                clean_last  = nom.strip().replace(" ", "_").lower()
                email      = row.get(mapping.get("email"))
                phone      = row.get(mapping.get("phone_number")) if mapping.get("phone_number") else None
                course     = row.get(mapping.get("course")) if mapping.get("course") else None

                if not email:
                    skipped.append({"email": "—", "reason": "Missing email"})
                    continue
                if User.objects.filter(email=email).exists():
                    skipped.append({"email": email, "reason": "Already exists"})
                    continue


                if role == "STUDENT":
                    password = f"{speciality}{current_year}"
                    try:
                        speciality_year_obj = SpecialityYear.objects.get(year=year, speciality=speciality)
                    except SpecialityYear.DoesNotExist:
                        return Response({"detail": "Speciality/year not found"}, status=404)

                    user = User.objects.create_user(
                    username=f"{clean_first}.{clean_last}",
                    first_name=prenom,
                    last_name=nom,
                    email=email,
                    password=password,
                    role=role,
                    identifier=identifier,
                    phone_number=phone,
                    )
                    StudentProfile.objects.create(
                        user=user,
                        speciality_year=speciality_year_obj
                    )

                elif role == "TEACHER":
                    password = current_year
                    user = User.objects.create_user(
                    username=f"{clean_first}.{clean_last}",
                    first_name=prenom,
                    last_name=nom,
                    email=email,
                    password=password,
                    role=role,
                    identifier=identifier,
                    phone_number=phone,
                    )
                    profile = TeacherProfile.objects.create(
                        user=user,
                        nom=nom,
                        prenom=prenom,
                    )

                    if course:
                        course_names = [c.strip() for c in str(course).split(",") if c.strip()]
                        
                        # Validate all courses exist
                        invalid = []
                        course_objects = []
                        for name in course_names:
                            try:
                                course_obj = Course.objects.get(name__iexact=name)
                                course_objects.append(course_obj)
                            except Course.DoesNotExist:
                                invalid.append(name)
                        
                        if invalid:
                            # Roll back the user we just created and skip
                            user.delete()
                            skipped.append({
                                "email": email,
                                "reason": f"Unknown course(s): {', '.join(invalid)}"
                            })
                            continue
                        
                        profile.courses.set(course_objects)

                created.append(email)

            except Exception as e:
                errors.append({"row": row, "error": str(e)})

        return Response({
            "created": len(created),
            "skipped": len(skipped),
            "errors":  len(errors),
            "details": {"created": created, "skipped": skipped, "errors": errors},
        })
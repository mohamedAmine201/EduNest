from django.shortcuts import render
from django.db import transaction
from rest_framework import generics, status
from rest_framework.views import APIView
from .models import Course, StudentCourse
from .serializers import CourseSerializer, EvaluationSerializer
from .permissions import IsHeadOrReadOnly

class CourseListeCreateAPIView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def perform_create(self, serializer):
        course = serializer.save()
        from profiles.models import StudentProfile 
        students = StudentProfile.objects.filter(
            speciality_year=course.semester.speciality_year
        )
        course.students.set(students)

    def get_queryset(self):
        user = self.request.user
        role = user.role
        if role == 'STUDENT':
            return Course.objects.filter(students=user.student_profile)
        elif role == 'TEACHER':
            return Course.objects.filter(teachers=user.teacher_profile)
        elif role == 'HEAD':
            return Course.objects.all()
        return Course.objects.none()

class StudentCoursesAPIView(APIView):
    def get(self, request):
        student = request.user.student_profile
        semester_num = request.query_params.get('semester')

        qs = StudentCourse.objects.filter(
            student=student
        ).select_related('course__semester')

        if semester_num:
            qs = qs.filter(
                course__semester__semester=semester_num
            )

        result = []
        for sc in qs:
            course = sc.course
            evaluations = course.evaluations.all()
            evals_data = []
            for ev in evaluations:
                student_eval = StudentEvaluation.objects.filter(
                    student=student, evaluation=ev
                ).first()
                evals_data.append({
                    'id': ev.id,
                    'name': ev.name,
                    'weight': ev.weight,
                    'grade': student_eval.grade if student_eval else None,
                })
            result.append({
                'id': course.id,
                'name': course.name,
                'coefficient': course.coefficient,
                'semester': course.semester.semester, 
                'evaluations': evals_data,
                'final_grade': sc.calculate_final_grade(),
            })
        return Response(result)

class CourseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        role = user.role
        if role == 'STUDENT':
            return Course.objects.filter(students=user.student_profile)
        elif role == 'TEACHER':
            return Course.objects.filter(teacher=user.teacher_profile)
        elif role == 'HEAD':
            return Course.objects.all()
        return Course.objects.none()

class CourseGradesListView(APIView):
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        results = StudentEvaluation.objects.filter(
            evaluation__course=course
        ).select_related('student', 'evaluation')

        data = []
        student_ids = set()
        for se in results:
            data.append({
                'student_id': se.student.pk,
                'eval_name': se.evaluation.name,
                'grade': se.grade,
            })
            student_ids.add(se.student.pk)

        # Compute and include final grade per student
        finals = {}
        for student_id in student_ids:
            sc = StudentCourse.objects.filter(
                student_id=student_id, course=course
            ).first()
            if sc:
                finals[student_id] = sc.calculate_final_grade()

        return Response({'grades': data, 'finals': finals})


class EvaluationListCreateView(generics.ListCreateAPIView):
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        return Evaluation.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        # Validate total weight won't exceed 1.0
        existing_weight = sum(
            e.weight for e in course.evaluations.all()
        )
        new_weight = serializer.validated_data['weight']
        if existing_weight + new_weight > 1.0 + 0.001:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                f"Total weight would exceed 1.0 (current: {existing_weight:.2f}, adding: {new_weight})"
            )
        serializer.save(course=course)


class StudentGradesUpdateView(APIView):
    def patch(self, request, course_id, student_id):
        # 1. Fetch relevant objects
        course = get_object_or_404(Course, id=course_id)
        student = get_object_or_404(StudentProfile, id=student_id)
        
        # 2. Extract grades dictionary: {"Exam": 15.5, "Quiz": null}
        grades_data = request.data.get('grades', {})
        
        try:
            with transaction.atomic():
                for eval_name, score in grades_data.items():
                    # Find the evaluation template for this course
                    evaluation = get_object_or_404(
                        Evaluation, 
                        course=course, 
                        name=eval_name
                    )
                    
                    # Update or Create the specific student's grade
                    # If score is null, we set it to None in the DB
                    StudentEvaluation.objects.update_or_create(
                        student=student,
                        evaluation=evaluation,
                        defaults={'grade': score}
                    )

                # 3. Update the Final Grade for the course
                # Get the link between this student and this course
                student_course, created = StudentCourse.objects.get_or_create(
                    student=student,
                    course=course
                )
                student_course.calculate_final_grade()
                student_course.save()

            return Response({
                "message": "Grades updated and average recalculated.",
                "final_grade": student_course.final_grade
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rapidfuzz import process, fuzz 

from .utils import normalize_eval_name, detect_grade_columns
from .models import Evaluation, StudentEvaluation
from profiles.models import StudentProfile 

import math

def sanitize(obj):
    if isinstance(obj, float) and math.isnan(obj):
        return None
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(i) for i in obj]
    return obj

FUZZY_THRESHOLD = 80 

def match_student(full_name, candidates):
    result = process.extractOne(
        full_name,
        candidates.keys(),
        scorer=fuzz.token_sort_ratio,
    )
    if result and result[1] >= FUZZY_THRESHOLD:
        matched_name, score, _ = result
        return candidates[matched_name], score 
    return None, 0

def find_header_row(file, existing_evals, max_scan=20):
    """
    Scan up to max_scan rows to find the one that contains
    nom/prenom/eval columns. Returns the 0-based row index, or raises.
    """
    file.seek(0)
    name = file.name.lower()

    if name.endswith(".csv"):
        raw = pd.read_csv(file, header=None, nrows=max_scan, dtype=str)
    else:
        raw = pd.read_excel(file, header=None, nrows=max_scan, dtype=str)

    for i, row in raw.iterrows():
        candidate_cols = [str(c).strip() for c in row if pd.notna(c) and str(c).strip()]
        if not candidate_cols:
            continue
        try:
            detect_grade_columns(candidate_cols, existing_evals)
            return i          # this row works as a header
        except (ValueError, KeyError):
            continue

    raise ValueError(
        "Could not find a header row containing 'nom', 'prenom', "
        "and at least one grade column in the first "
        f"{max_scan} rows."
    )

class GradeUploadPreviewAPIView(APIView):
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=400)

        # ── file reading ──────────────────────────────────────────────────────────────
        name = file.name.lower()
        existing_evals = list(course.evaluations.values_list('name', flat=True))

        try:
            header_row = find_header_row(file, existing_evals)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        file.seek(0)   # rewind after the scan
        if name.endswith(".csv"):
            df = pd.read_csv(file, header=header_row, dtype=str)
        elif name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file, header=header_row, dtype=str)
        else:
            return Response({"error": "Unsupported format."}, status=400)

        # existing cleanup: strip nameless/nan/empty columns and blank rows
        df = df.loc[:, df.columns.notna()]
        df = df.loc[:, ~df.columns.astype(str).str.strip().isin(['nan', ''])]
        df = df.dropna(how='all')
        # ── rest of the view stays exactly the same ───────────────────────────────────
        try:
            existing_evals = list(course.evaluations.values_list('name', flat=True))
            col_map = detect_grade_columns(list(df.columns), existing_evals)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        nom_col = col_map["nom"]
        prenom_col = col_map["prenom"]
        raw_eval_cols = col_map["eval_columns"]

        # Fuzzy match spreadsheet columns to existing Evaluation names
        existing_evals = list(course.evaluations.values_list('name', flat=True))
        eval_col_map = {}  # spreadsheet col → matched eval name
        for col in raw_eval_cols:
            matched = normalize_eval_name(col, existing_evals)
            eval_col_map[col] = matched

        enrolled = course.students.select_related('user').all()
        candidates = {}
        for s in enrolled:
            try:
                last = s.user.last_name
                first = s.user.first_name
            except AttributeError:
                last = getattr(s, "nom", "") or ""
                first = getattr(s, "prenom", "") or ""
            full = f"{last} {first}".strip()
            if full:
                candidates[full] = s.pk

        matched_rows = []
        unmatched_rows = []

        for _, row in df.iterrows():
            nom = str(row[nom_col]).strip()
            prenom = str(row[prenom_col]).strip()
            full_name = f"{nom} {prenom}"

            grades = {}
            for col, eval_name in eval_col_map.items():
                try:
                    grades[eval_name] = float(row[col])
                except (ValueError, TypeError):
                    grades[eval_name] = None

            student_id, score = match_student(full_name, candidates)
            if student_id is not None:
                matched_rows.append({
                    "student_id": student_id,
                    "display_name": full_name,
                    "match_score": score,
                    "grades": grades,
                })
            else:
                unmatched_rows.append({"raw_name": full_name, "grades": grades})

        return Response(sanitize({
            "eval_columns": list(eval_col_map.values()),
            "matched":      matched_rows,
            "unmatched":    unmatched_rows,
        }))

class GradeConfirmAPIView(APIView):
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        eval_columns = request.data.get('eval_columns', [])
        rows = request.data.get('rows', [])

        if not eval_columns or not rows:
            return Response({"error": "Missing eval_columns or rows."}, status=400)

        # Map eval name → Evaluation object
        eval_map = {}
        for name in eval_columns:
            try:
                eval_map[name] = Evaluation.objects.get(course=course, name=name)
            except Evaluation.DoesNotExist:
                return Response({"error": f"Evaluation '{name}' not found for this course."}, status=400)

        created_count = 0
        updated_count = 0

        for row in rows:
            student_id = row.get('student_id')
            grades = row.get('grades', {})

            try:
                student = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                continue

            for eval_name, grade_value in grades.items():
                evaluation = eval_map.get(eval_name)
                if not evaluation or grade_value is None:
                    continue

                obj, created = StudentEvaluation.objects.update_or_create(
                    student=student,
                    evaluation=evaluation,
                    defaults={'grade': grade_value}
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        return Response({"created": created_count, "updated": updated_count})
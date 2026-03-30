from rapidfuzz import process

FIELD_ALIASES = {
    "matricule": ["matricule", "Matricule", "MATRICULE", "mat", "Mat", "id", "ID",
                  "identifiant", "Identifiant", "code", "Code", "numéro", "numero"],
    "nom":       ["nom", "Nom", "NOM", "name", "Name", "last_name", "lastname",
                  "famille", "Famille", "nom complet", "Nom Complet", "NOM COMPLET",  # ← add these
                  "full name", "Full Name", "fullname",
                  "nom de famille", "Nom de famille"],
    "prenom":    ["prenom", "Prenom", "prénom", "Prénom", "PRENOM", "first_name",
                  "firstname", "given_name"],
    "email":     ["email", "Email", "EMAIL", "e-mail", "E-mail", "mail",
                  "Mail", "courriel", "Courriel"],
    "course":    ["course", "Course", "COURSE", "matière", "Matière", "MATIERE",
                  "matiere", "module", "Module", "MODULE", "cours", "Cours", "COURS",
                  "subject", "Subject", "discipline", "Discipline"],
}

def detect_columns_fuzzy(headers: list[str]) -> dict:
    mapping = {}
    used_headers = set()
    for field, aliases in FIELD_ALIASES.items():
        for header in headers:
            if header in aliases and header not in used_headers:
                mapping[field] = header
                used_headers.add(header)
                break
        if field not in mapping:
            candidates = [h for h in headers if h not in used_headers]
            if candidates:
                match, score, _ = process.extractOne(query=field, choices=candidates)
                if score > 80:
                    mapping[field] = match
                    used_headers.add(match)
    return mapping

def smart_detect_columns(headers: list[str]) -> dict:
    return detect_columns_fuzzy(headers)
from rapidfuzz import process, fuzz

FUZZY_THRESHOLD = 75

def normalize_eval_name(col, existing_eval_names):
    if not existing_eval_names:
        return col
    result = process.extractOne(
        col.lower(),
        [e.lower() for e in existing_eval_names],
        scorer=fuzz.partial_ratio,
    )
    if result and result[1] >= FUZZY_THRESHOLD:
        idx = [e.lower() for e in existing_eval_names].index(result[0])
        return existing_eval_names[idx]
    return col

def detect_grade_columns(columns, existing_eval_names):
    name_variants = {"nom", "Nom", "NOM", "name", "Name", "last_name", "lastname",
                     "last_name", "last name", "Last Name",
                     "famille", "Famille", "nom complet", "Nom Complet",
                     "full name", "Full Name", "fullname", "nom de famille"}
    first_variants = {"prenom", "Prenom", "prénom", "Prénom", "PRENOM", "first_name",
                     "first_name", "first name", "First Name",
                     "firstname", "given_name"}

    nom_col    = next((c for c in columns if c.strip().lower() in name_variants), None)
    prenom_col = next((c for c in columns if c.strip().lower() in first_variants), None)


    if not nom_col or not prenom_col:
        raise ValueError("Could not detect 'nom' and 'prenom' columns.")

    # Only keep columns that match an existing evaluation
    eval_cols = []
    for c in columns:
        if c in (nom_col, prenom_col):
            continue
        matched = normalize_eval_name(c, existing_eval_names)
        if matched in existing_eval_names:
            eval_cols.append(c)

    return {"nom": nom_col, "prenom": prenom_col, "eval_columns": eval_cols}
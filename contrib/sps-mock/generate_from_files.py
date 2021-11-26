#!/usr/bin/env python3
import os.path
import os
import sys
from pprint import pprint
from collections import defaultdict
import json
import uuid

def usage():
    print('./generate_from_files.py <dossier d\'entrée>')
    print('génère une base de données bouchon pour SPS.')

def read_fs_tree(folder):
    for root, dirs, files in os.walk(folder):
        yield (root, files)

def build_affaires(folder):
    names = None
    affaires = defaultdict(dict)
    for root, dirs, _ in os.walk(folder):
        if root == folder:
            names = set(dirs)
            break

    for n in names:
        for root, files in read_fs_tree(os.path.join(folder, n)):
            for file in files:
                if os.path.isdir(file):
                    continue
                if 'pieces' not in affaires[n]:
                    affaires[n]['pieces'] = []

                rel_dir = os.path.relpath(root, folder)
                rel_file = os.path.join(rel_dir, file)
                affaires[n]['pieces'].append({'path': rel_file})

    return affaires

def generate_idj():
    return str(uuid.uuid4())

def main():
    if len(sys.argv) < 2:
        usage()
        sys.exit(1)

    input_folder = sys.argv[1]
    affaires = build_affaires(input_folder)

    for _, values in affaires.items():
        values['idj'] = generate_idj()


    db = {"affaires": [ { "id": vals['idj'], "title": key } for key, vals in affaires.items() ], "pieces": [] }

    for vals in affaires.values():
        db['pieces'].extend(
            ({'affaireId': vals['idj'], 'path': subvals['path']} for subvals in vals['pieces'])
        )

    json.dump(db, sys.stdout)


if __name__ == '__main__':
    main()

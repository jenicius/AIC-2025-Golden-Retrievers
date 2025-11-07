import os
from app.core.config import settings

folder_name = 'queries'

def read_queries_from_folder():
    folder_path = os.path.join(settings.DATA_PATH, folder_name)
    queries_text = []
    queries_names = []

    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        if file.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                queries_text.append(content)
                queries_names.append(file.replace('.txt', ''))

    return queries_text, queries_names
import re

QA_RE = re.compile(r'[-]*\s*(?:QUESTION|Question)\s*?:\s?(?P<question>.*?)[-]+\s*(?:REPONSE|Réponse)!?\s*?:\s?(?P<reponse>.*?)[-]+\s*(?=QUESTION|Question|Après lecture faite|\n)', re.DOTALL)

def extract_qa_session(text):
    return QA_RE.findall(text)

"""
Utilitaires d'extraction de données
et de nettoyage, pour les PDF A3.
"""

import PyPDF2
import PyPDF2.utils
import pdftotext
import xmltodict
from xml.etree import ElementTree

def extract_xml(file):
    try:
        pdf = PyPDF2.PdfFileReader(file)
    except PyPDF2.utils.PdfReadError:
        raise ValueError("Damaged PDF or not a PDF!")

    try:
        catalog = pdf.trailer['/Root']
        embedded_files = catalog['/Names']['/EmbeddedFiles']['/Names']

        if 'Données' in embedded_files[0]:
            soup = embedded_files[1].getObject()

            return soup['/EF']['/F'].getData()
    except KeyError:
        # Le PDF ne semble pas A3.
        return None

    return None

def extract_xml_into_json(file):
    xml_soup = extract_xml(file)
    if not xml_soup:
        return None

    return xmltodict.parse(xml_soup.decode('utf8'))

def extract_text(file):
    try:
        pdf = pdftotext.PDF(file)
        return (str(page) for page in pdf)
    except pdftotext.Error:
        # Le PDF ne semble pas nativement numérique ou n'est pas un PDF.
        return None
